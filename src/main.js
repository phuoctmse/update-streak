import { Client, Databases, Query } from 'node-appwrite';

// This function will be triggered by Appwrite's scheduled function
export default async function updateStreaks(req: any, res: any) {
  console.log('Starting streak update process...');
  
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT as string)
    .setProject(process.env.APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string);

  const databases = new Databases(client);

  try {
    console.log('Fetching users from leaderboard...');
    // Get all users from leaderboard
    const users = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID as string,
      process.env.APPWRITE_LEADERBOARD_COLLECTION_ID as string
    );

    console.log(`Found ${users.documents.length} users in leaderboard`);

    const now = new Date();
    const today = now.toDateString();

    // Process each user
    for (const user of users.documents) {
      const lastUpdate = new Date(user.updated_at);
      console.log(`Processing user ${user.$id}:`);
      console.log(`- Last update: ${lastUpdate.toDateString()}`);
      console.log(`- Current streak: ${user.streak}`);
      
      // Only update if not already updated today
      if (lastUpdate.toDateString() !== today) {
        console.log(`- Updating streak for user ${user.$id}`);
        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID as string,
          process.env.APPWRITE_LEADERBOARD_COLLECTION_ID as string,
          user.$id,
          {
            streak: user.streak + 1,
            updated_at: now.toISOString(),
          }
        );
        console.log(`- Streak updated successfully to ${user.streak + 1}`);
      } else {
        console.log(`- Streak already updated today, skipping`);
      }
    }

    console.log('Streak update process completed successfully');
    return res.json({
      success: true,
      message: 'Daily streaks updated successfully'
    });
  } catch (error: any) {
    console.error('Error in streak update process:', error);
    console.log('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return res.json({
      success: false,
      message: `Failed to update streaks: ${error.message}`
    }, 500);
  }
}
