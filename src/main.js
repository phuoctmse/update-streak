import { Client, Databases } from 'node-appwrite';

// This function will be triggered by Appwrite's scheduled function
export default async function updateStreaks(req: any, res: any) {
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT as string)
    .setProject(process.env.APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string);

  const databases = new Databases(client);

  try {
    // Get all users from leaderboard
    const users = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID as string,
      process.env.APPWRITE_LEADERBOARD_COLLECTION_ID as string
    );

    const now = new Date();
    const today = now.toDateString();

    // Process each user
    for (const user of users.documents) {
      const lastUpdate = new Date(user.updated_at);
      
      // Only update if not already updated today
      if (lastUpdate.toDateString() !== today) {
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID as string,
          process.env.APPWRITE_LEADERBOARD_COLLECTION_ID as string,
          user.$id,
          {
            streak: user.streak + 1,
            updated_at: now.toISOString(),
          }
        );
      }
    }

    return res.json({
      success: true,
      message: 'Daily streaks updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating streaks:', error);
    return res.json({
      success: false,
      message: `Failed to update streaks: ${error.message}`
    }, 500);
  }
} 
