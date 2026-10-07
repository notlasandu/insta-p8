const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://exkefrxudvgxymaulopu.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4a2Vmcnh1ZHZneHltYXVsb3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM4MzIsImV4cCI6MjEwMjk3OTgzMn0.YIgapOjJ59LTZ8bJjp4hDTPph5yOas3jtRzLgGUKbGQ";
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "EAAUUnLUVqOoBSqQ1zpVBcbS8qU3xQZAyoAuk67QvEx9gx66JbxbYnzZBeBnGBcoC4VDDXVYBMK0BZBArMDr1qZByhZBuvNpU94twxqase28HNyq6ZBxZAQRheS1wJ0R8rHwhHvu4iwrdxD8qwoU22iSJgzNj1COkT0KLk5mZCZADCKZCsmz2jRYQd0MSS8eZBDCmrh2ZBTOYTIzDQPrwCMbDB0vY";
const PAGE_ID = process.env.PAGE_ID || "1353894244476166";
const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID || "17841423877461958";
const USER_ID = 1618667293386976;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncFacebookConversations() {
  console.log("🔵 Syncing Facebook Page Conversations...");
  try {
    const url = `https://graph.facebook.com/v21.0/${PAGE_ID}/conversations?fields=id,updated_time,participants,messages{id,message,from,to,created_time}&access_token=${META_ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("FB conversations error:", data.error.message);
      return;
    }

    const threads = data.data || [];
    console.log(`Found ${threads.length} Facebook conversation thread(s).`);

    for (const thread of threads) {
      const participants = thread.participants?.data || [];
      const contact = participants.find((p) => p.id !== PAGE_ID) || participants[0] || { id: "unknown", name: "User" };
      const messages = thread.messages?.data || [];
      const latestMessage = messages[0]?.message || "";

      // 1. Upsert conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .upsert(
          {
            user_id: USER_ID,
            recipient_id: contact.id,
            recipient_username: contact.name,
            platform: "facebook",
            thread_id: thread.id,
            last_message_snippet: latestMessage.slice(0, 150),
            unread_count: 0,
            last_message_at: thread.updated_time,
          },
          { onConflict: "user_id,platform,recipient_id" }
        )
        .select("id")
        .single();

      if (convErr) {
        console.error(`Failed to upsert conversation ${thread.id}:`, convErr.message);
        continue;
      }

      const convId = conv.id;

      // 2. Upsert messages
      for (const msg of messages) {
        if (!msg.message) continue;
        const isFromUser = msg.from?.id === PAGE_ID;
        await supabase.from("messages").upsert(
          {
            id: msg.id,
            conversation_id: convId,
            user_id: USER_ID,
            sender_id: msg.from?.id || contact.id,
            sender_username: msg.from?.name || contact.name,
            content: msg.message,
            platform: "facebook",
            sender_type: isFromUser ? "user" : "contact",
            is_from_instagram: false,
            created_at: msg.created_time,
          },
          { onConflict: "id" }
        );
      }
    }
  } catch (err) {
    console.error("Facebook sync error:", err);
  }
}

async function syncInstagramConversations() {
  console.log("🟣 Syncing Instagram Direct Conversations...");
  try {
    const url = `https://graph.facebook.com/v21.0/${PAGE_ID}/conversations?platform=instagram&fields=id,updated_time,participants,messages{id,message,from,to,created_time}&access_token=${META_ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.warn("Instagram conversations warning:", data.error.message);
      return;
    }

    const threads = data.data || [];
    console.log(`Found ${threads.length} Instagram conversation thread(s).`);

    for (const thread of threads) {
      const participants = thread.participants?.data || [];
      const contact = participants.find((p) => p.id !== IG_ACCOUNT_ID) || participants[0] || { id: "unknown", name: "User" };
      const messages = thread.messages?.data || [];
      const latestMessage = messages[0]?.message || "";

      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .upsert(
          {
            user_id: USER_ID,
            recipient_id: contact.id,
            recipient_username: contact.name || contact.username || `ig_${contact.id.slice(0, 5)}`,
            platform: "instagram",
            thread_id: thread.id,
            last_message_snippet: latestMessage.slice(0, 150),
            unread_count: 0,
            last_message_at: thread.updated_time,
          },
          { onConflict: "user_id,platform,recipient_id" }
        )
        .select("id")
        .single();

      if (convErr) {
        console.error(`Failed to upsert IG conversation ${thread.id}:`, convErr.message);
        continue;
      }

      const convId = conv.id;

      for (const msg of messages) {
        if (!msg.message) continue;
        const isFromUser = msg.from?.id === IG_ACCOUNT_ID;
        await supabase.from("messages").upsert(
          {
            id: msg.id,
            conversation_id: convId,
            user_id: USER_ID,
            sender_id: msg.from?.id || contact.id,
            sender_username: msg.from?.name || contact.name,
            content: msg.message,
            platform: "instagram",
            sender_type: isFromUser ? "user" : "contact",
            is_from_instagram: !isFromUser,
            created_at: msg.created_time,
          },
          { onConflict: "id" }
        );
      }
    }
  } catch (err) {
    console.error("Instagram sync error:", err);
  }
}

async function syncFacebookComments() {
  console.log("💬 Syncing Facebook Post Comments...");
  try {
    const url = `https://graph.facebook.com/v21.0/${PAGE_ID}/feed?fields=id,message,created_time,permalink_url,full_picture,comments{id,message,from,created_time,like_count,comment_count,comments{id,message,from,created_time,like_count}}&limit=15&access_token=${META_ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.warn("FB feed error:", data.error.message);
      return;
    }

    const posts = data.data || [];
    let commentCount = 0;

    for (const post of posts) {
      const comments = post.comments?.data || [];
      for (const comment of comments) {
        if (!comment.message) continue;

        const replies = (comment.comments?.data || []).map((r) => ({
          id: r.id,
          sender_id: r.from?.id || "unknown",
          sender_username: r.from?.name || "User",
          text: r.message,
          created_at: r.created_time,
          like_count: r.like_count || 0,
        }));

        await supabase.from("post_comments").upsert(
          {
            id: comment.id,
            user_id: USER_ID,
            platform: "facebook",
            post_id: post.id,
            post_caption: post.message ? post.message.slice(0, 120) : "Facebook Post",
            post_media_url: post.full_picture || null,
            post_permalink: post.permalink_url || null,
            parent_comment_id: null,
            sender_id: comment.from?.id || "unknown",
            sender_username: comment.from?.name || "User",
            text: comment.message,
            like_count: comment.like_count || 0,
            reply_count: replies.length,
            replies,
            created_at: comment.created_time,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        commentCount++;
      }
    }
    console.log(`Synced ${commentCount} Facebook comment(s).`);
  } catch (err) {
    console.error("Facebook comments sync error:", err);
  }
}

async function syncInstagramComments() {
  console.log("💬 Syncing Instagram Media Comments...");
  try {
    const url = `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments{id,text,username,timestamp,like_count,replies{id,text,username,timestamp,like_count}}&limit=15&access_token=${META_ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.warn("IG media error:", data.error.message);
      return;
    }

    const mediaList = data.data || [];
    let commentCount = 0;

    for (const media of mediaList) {
      const comments = media.comments?.data || [];
      for (const comment of comments) {
        if (!comment.text) continue;

        const replies = (comment.replies?.data || []).map((r) => ({
          id: r.id,
          sender_id: r.username || "unknown",
          sender_username: r.username || "User",
          text: r.text,
          created_at: r.timestamp,
          like_count: r.like_count || 0,
        }));

        await supabase.from("post_comments").upsert(
          {
            id: comment.id,
            user_id: USER_ID,
            platform: "instagram",
            post_id: media.id,
            post_caption: media.caption ? media.caption.slice(0, 120) : "Instagram Media",
            post_media_url: media.thumbnail_url || media.media_url || null,
            post_permalink: media.permalink || null,
            parent_comment_id: null,
            sender_id: comment.username || "unknown",
            sender_username: comment.username || "User",
            text: comment.text,
            like_count: comment.like_count || 0,
            reply_count: replies.length,
            replies,
            created_at: comment.timestamp,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
        commentCount++;
      }
    }
    console.log(`Synced ${commentCount} Instagram comment(s).`);
  } catch (err) {
    console.error("Instagram comments sync error:", err);
  }
}

async function run() {
  console.log("=== Starting Historical Sync ===");
  await syncFacebookConversations();
  await syncInstagramConversations();
  await syncFacebookComments();
  await syncInstagramComments();
  console.log("=== Historical Sync Complete! ===");
}

run().catch(console.error);
