import { NextRequest } from "next/server";
import { successResponse, handleApiError, handleOptions, corsHeaders } from "../../../lib/utils/errors";
import { logger } from "../../../lib/utils/logger";

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  description: string;
  scenario: string;
  likes: number;
  timestamp: string;
}

// In-memory store for now
const communityPosts: CommunityPost[] = [];

/**
 * POST /api/community
 * Submit a new community post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, title, description, scenario } = body;

    if (!author || !title || !scenario) {
      return successResponse({ success: false, error: "Missing required fields: author, title, scenario" }, 400);
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author,
      title,
      description: description || "",
      scenario,
      likes: 0,
      timestamp: new Date().toISOString(),
    };

    communityPosts.push(newPost);
    logger.info("[POST /api/community] Post created:", { id: newPost.id });

    const response = successResponse({ post: newPost });
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (err) {
    const response = handleApiError(err);
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }
}

/**
 * GET /api/community
 * Get all community posts
 */
export async function GET() {
  try {
    const sorted = [...communityPosts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const response = successResponse({ posts: sorted });
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (err) {
    const response = handleApiError(err);
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }
}

export async function OPTIONS() {
  return handleOptions();
}
