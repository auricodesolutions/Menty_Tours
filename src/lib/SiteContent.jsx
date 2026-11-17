import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BASE } from "./apiConfig";
import { DEFAULT_DESTINATIONS } from "../data/destinationDefaults";
import { DEFAULT_STORIES } from "../data/storyDefaults";
import { DEFAULT_MEDIA } from "../data/mediaDefaults";
import { FEATURED_PACKAGE } from "../data/featuredTour";

const withIds = (items, prefix) => items.map((item, index) => ({ ...item, id: item.id || `${prefix}-${index + 1}` }));
export const DEFAULT_COLLECTIONS = { destinations: withIds(DEFAULT_DESTINATIONS, "destination"), stories: withIds(DEFAULT_STORIES, "story"), tours: [FEATURED_PACKAGE] };
const initial = { collections: DEFAULT_COLLECTIONS, settings: DEFAULT_MEDIA, versions: {}, connected: false, loading: true, error: "" };
const ContentContext = createContext({ ...initial, refresh: async () => {}, media: (key) => DEFAULT_MEDIA[key] || null });

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(initial);
  const refresh = useCallback(async (signal) => {
    try {
      const response = await fetch(`${API_BASE}/api/content`, { signal, cache: "no-cache" });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Content server unavailable");
      const data = result.data;
      setContent({ collections: { ...DEFAULT_COLLECTIONS, ...data.collections }, settings: { ...DEFAULT_MEDIA, ...data.settings }, versions: data.versions || {}, connected: true, loading: false, error: "" });
    } catch (error) {
      if (error.name === "AbortError") return;
      setContent((current) => ({ ...current, connected: false, loading: false, error: "Unable to reach the content server. Start the PHP backend and check its database configuration." }));
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    refresh(controller.signal);
    return () => { controller.abort(); };
  }, [refresh]);
  const media = (key) => content.settings[key] || null;
  return <ContentContext.Provider value={{ ...content, refresh, media }}>{children}</ContentContext.Provider>;
}
export const useSiteContent = () => useContext(ContentContext);
