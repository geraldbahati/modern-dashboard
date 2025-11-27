/**
 * AI Assistant Server Actions with Generative UI
 * Uses AI SDK RSC for streaming React components
 */

"use server";

import { streamUI } from "@ai-sdk/rsc";
import { getModel, type ModelId } from "@workspace/ai/provider";
import { systemPrompt } from "@workspace/ai";
import { auth } from "@workspace/auth/next";
import { headers } from "next/headers";
import { createClient } from "@workspace/api/client";
import { cookies } from "next/headers";
import {
  listUsersSchema,
  getUserByIdSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  banUserSchema,
  unbanUserSchema,
  type ListUsersInput,
  type GetUserByIdInput,
  type CreateUserInput,
  type UpdateUserInput,
  type BanUserInput,
  type UnbanUserInput,
  type DeleteUserInput,
} from "@workspace/ai/tools";

// Inline components for RSC compatibility
// These must be defined in the same file as streamUI to work with Next.js 16 + Turbopack

function LoadingUsers() {
  return (
    <div className="w-full border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <h3 className="font-semibold">Loading users...</h3>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-md" />
        ))}
      </div>
    </div>
  );
}

function LoadingUserDetails() {
  return (
    <div className="w-full border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <h3 className="font-semibold">Loading user details...</h3>
      </div>
      <div className="space-y-4">
        <div className="h-24 bg-gray-200 animate-pulse rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 animate-pulse rounded-md" />
          <div className="h-20 bg-gray-200 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <svg
          className="h-5 w-5 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <p className="text-green-900 font-medium">{message}</p>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <svg
          className="h-5 w-5 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <p className="text-red-900 font-medium">{message}</p>
      </div>
    </div>
  );
}

export async function sendMessage(
  message: string,
  modelId: ModelId = "gpt-4o",
) {
  // Authenticate user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      display: <ErrorMessage message="Unauthorized. Please log in." />,
    };
  }

  // Create oRPC client with auth
  const cookieStore = await cookies();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const RPC_URL = `${API_URL}/api/rpc`;

  const client = createClient({
    baseUrl: RPC_URL,
    headers: () => ({ cookie: cookieStore.toString() }),
  });

  // Stream UI with tools
  const result = await streamUI({
    model: getModel(modelId),
    system: systemPrompt,
    prompt: message,
    text: ({ content, done }: { content: string; done: boolean }) => {
      if (done) {
        return <div className="prose prose-sm max-w-none">{content}</div>;
      }
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span>{content}</span>
        </div>
      );
    },
    tools: {
      // LIST USERS with visual component
      listUsers: {
        description:
          "List and search users with optional filters. Use this to show users, search by name/email, or filter by role/status. Returns a visual table component.",
        inputSchema: listUsersSchema,
        generate: async function* (params: ListUsersInput) {
          yield <LoadingUsers />;

          try {
            const result = await client.users.list(params);

            // Return inline users table component
            return (
              <div className="w-full border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-lg">Users</h3>
                  <p className="text-sm text-gray-600">Total: {result.total}</p>
                </div>
                <div className="divide-y">
                  {result.users.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                            {user.role}
                          </span>
                          {user.emailVerified && (
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                              Verified
                            </span>
                          )}
                          {user.banned && (
                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                              Banned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          } catch (error) {
            return (
              <ErrorMessage
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch users"
                }
              />
            );
          }
        },
      },

      // GET USER BY ID with visual component
      getUserById: {
        description:
          "Get detailed information about a specific user by their ID. Returns a comprehensive user profile card.",
        inputSchema: getUserByIdSchema,
        generate: async function* (params: GetUserByIdInput) {
          yield <LoadingUserDetails />;

          try {
            const user = await client.users.getById({ id: params.userId });

            if (!user) {
              return <ErrorMessage message="User not found" />;
            }

            // Return inline user details component
            return (
              <div className="w-full border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-lg">User Details</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold">{user.name}</h4>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Role</p>
                      <p className="font-medium capitalize">{user.role}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="font-medium">
                        {user.banned ? "Banned" : "Active"}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Email Verified
                      </p>
                      <p className="font-medium">
                        {user.emailVerified ? "Yes" : "No"}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">2FA Enabled</p>
                      <p className="font-medium">
                        {user.twoFactorEnabled ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Updated: {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          } catch (error) {
            return (
              <ErrorMessage
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to fetch user"
                }
              />
            );
          }
        },
      },

      // CREATE USER
      createUser: {
        description:
          "Create a new user with the specified details. Requires name and email at minimum. Returns success confirmation.",
        inputSchema: createUserSchema,
        generate: async function* (params: CreateUserInput) {
          yield (
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <p>Creating user...</p>
              </div>
            </div>
          );

          try {
            const user = await client.users.create(params);
            return (
              <SuccessMessage
                message={`User "${user.name}" created successfully!`}
              />
            );
          } catch (error) {
            return (
              <ErrorMessage
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to create user"
                }
              />
            );
          }
        },
      },

      // UPDATE USER
      updateUser: {
        description:
          "Update an existing user's information. Only provided fields will be updated.",
        inputSchema: updateUserSchema,
        generate: async function* (params: UpdateUserInput) {
          yield (
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <p>Updating user...</p>
              </div>
            </div>
          );

          try {
            const user = await client.users.update(params);
            return (
              <SuccessMessage
                message={`User "${user.name}" updated successfully!`}
              />
            );
          } catch (error) {
            return (
              <ErrorMessage
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to update user"
                }
              />
            );
          }
        },
      },

      // BAN USER
      banUser: {
        description:
          "Ban a user from the platform. Requires userId and reason. Optionally set an expiration date.",
        inputSchema: banUserSchema,
        generate: async function* (params: BanUserInput) {
          yield (
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <p>Banning user...</p>
              </div>
            </div>
          );

          try {
            await client.users.ban(params);
            return (
              <SuccessMessage
                message={`User has been banned. Reason: ${params.reason}`}
              />
            );
          } catch (error) {
            return (
              <ErrorMessage
                message={
                  error instanceof Error ? error.message : "Failed to ban user"
                }
              />
            );
          }
        },
      },

      // UNBAN USER
      unbanUser: {
        description: "Remove a ban from a user, restoring their access.",
        inputSchema: unbanUserSchema,
        generate: async function* (params: UnbanUserInput) {
          yield (
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <p>Unbanning user...</p>
              </div>
            </div>
          );

          try {
            await client.users.unban({ id: params.userId });
            return (
              <SuccessMessage message="User has been unbanned successfully!" />
            );
          } catch (error) {
            return (
              <ErrorMessage
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to unban user"
                }
              />
            );
          }
        },
      },

      // DELETE USER
      deleteUser: {
        description:
          "Delete a user from the system. Can be a soft delete (ban) or permanent deletion.",
        inputSchema: deleteUserSchema,
        generate: async function* (params: DeleteUserInput) {
          yield (
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                <p>Deleting user...</p>
              </div>
            </div>
          );

          try {
            await client.users.delete(params);
            const deleteType = params.permanent
              ? "permanently deleted"
              : "soft deleted";
            return <SuccessMessage message={`User has been ${deleteType}.`} />;
          } catch (error) {
            return (
              <ErrorMessage
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to delete user"
                }
              />
            );
          }
        },
      },
    },
  });

  return {
    display: result.value,
  };
}
