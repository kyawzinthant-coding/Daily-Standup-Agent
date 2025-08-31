import { handlePrismaError, prisma } from "../../database";
import { logger } from "../../utils/logger";

export const handleClerkService = async (webhookData: any) => {
  const { type, data } = webhookData;

  logger.info(`Processing Clerk webhook: ${type}`, { clerkId: data?.id });

  try {
    switch (type) {
      case "user.created":
        return await createUserService(data);
      case "user.updated":
        return await updateUserService(data);
      case "user.deleted":
        return await deleteUserService(data);
      default:
        logger.warn(`Unhandled webhook type: ${type}`);
        return {
          success: true,
          message: `Webhook type '${type}' received but not processed`,
        };
    }
  } catch (error) {
    logger.error(`Failed to process webhook: ${type}`, {
      error: error instanceof Error ? error.message : String(error),
      clerkId: data?.id,
    });
    throw error;
  }
};

const createUserService = async (userData: any) => {
  logger.info(`Creating user from webhook`, { clerkId: userData?.id });
  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userData.id },
    });

    if (existingUser) {
      logger.info(`User already exists: ${existingUser.id}`);
      return {
        success: true,
        message: "User already exists",
        user: existingUser,
      };
    }
    const primaryEmail =
      userData.email_addresses.find(
        (email: any) => email.id === userData.primary_email_address_id
      ) || userData.email_addresses[0];

    if (!primaryEmail) {
      throw new Error("No email address found for user");
    }
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          clerkId: userData.id,
          email: primaryEmail.email_address,
        },
      });

      logger.info(`User created with ID: ${user.id}`);

      return {
        user,
      };
    });

    logger.info(`User setup completed successfully`, {
      userId: result.user.id,
      clerkId: result.user.clerkId,
      email: result.user.email,
    });

    return {
      success: true,
      message:
        "User created successfully. User got Default chat just for the orientation and Thread ID which needed to be store on FE.",
      data: {
        userId: result.user.id,

        userEmail: result.user.email,
        clerkId: result.user.clerkId,
      },
    };
  } catch (error) {
    logger.error("Failed to create user from webhook", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clerkId: userData?.id,
    });
    return handlePrismaError(error);
  }
};

const updateUserService = async (userData: any) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userData.id },
    });

    if (!existingUser) {
      logger.warn(`User not found for update: ${userData.id}`);
      return {
        success: false,
        message: "User not found",
      };
    }

    // Get the primary email
    const primaryEmail =
      userData.email_addresses.find(
        (email: any) => email.id === userData.primary_email_address_id
      ) || userData.email_addresses[0];

    const updateData: any = {};

    // Only update email if it has changed
    if (primaryEmail && primaryEmail.email_address !== existingUser.email) {
      updateData.email = primaryEmail.email_address;
    }

    // If no changes, return early
    if (Object.keys(updateData).length === 0) {
      logger.info(`No changes detected for user: ${existingUser.id}`);
      return {
        success: true,
        message: "No changes detected",
        user: existingUser,
      };
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: userData.id },
      data: updateData,
    });

    logger.info(`User updated successfully`, {
      userId: updatedUser.id,
      clerkId: updatedUser.clerkId,
      changes: updateData,
    });

    return {
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    logger.error("Failed to update user from webhook", {
      error: error instanceof Error ? error.message : String(error),
      clerkId: userData?.id,
    });
    return handlePrismaError(error);
  }
};

const deleteUserService = async (userData: any) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userData.id },
    });

    if (!existingUser) {
      logger.warn(`User not found for deletion: ${userData.id}`);
      return {
        success: false,
        message: "User not found",
      };
    }

    // Soft delete - set deletedAt timestamp
    const deletedUser = await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        deletedAt: new Date(),
      },
    });

    logger.info(`User soft deleted successfully`, {
      userId: deletedUser.id,
      clerkId: deletedUser.clerkId,
      deletedAt: deletedUser.deletedAt,
    });

    return {
      success: true,
      message: "User deleted successfully",
      user: deletedUser,
    };
  } catch (error) {
    logger.error("Failed to delete user from webhook", {
      error: error instanceof Error ? error.message : String(error),
      clerkId: userData?.id,
    });
    return handlePrismaError(error);
  }
};

export const findUserByClerkId = async (clerkId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkId,
      },
    });

    return user;
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const findUserByID = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const getAllActiveUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    return handlePrismaError(error);
  }
};

export const hardDeleteUser = async (clerkId: string) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        clerkId: clerkId,
      },
    });

    logger.info(`User hard deleted`, {
      userId: deletedUser.id,
      clerkId: deletedUser.clerkId,
    });

    return {
      success: true,
      message: "User permanently deleted",
      user: deletedUser,
    };
  } catch (error) {
    logger.error("Failed to hard delete user", {
      error: error instanceof Error ? error.message : String(error),
      clerkId,
    });
    return handlePrismaError(error);
  }
};
