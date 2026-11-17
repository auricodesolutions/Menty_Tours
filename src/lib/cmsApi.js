import { req, uploadFile as sendUpload } from "./adminApi";
export const publishCollection = (kind, items, version) => req(`/api/admin/collections/${kind}`, { method: "PUT", auth: true, json: { items, version } });
export const publishMedia = (key, value, version) => req(`/api/admin/media/${key}`, { method: "PUT", auth: true, json: { value, version } });
export const listUploads = () => req("/api/admin/uploads", { auth: true });
export const removeUpload = (id) => req(`/api/admin/uploads/${id}`, { method: "DELETE", auth: true });
export const uploadFile = (file) => {
  const video = file.type.startsWith("video/") || /\.(mp4|webm)$/i.test(file.name);
  const limit = video ? 15 : 10;
  if (file.size > limit * 1024 * 1024) return Promise.reject(new Error(`${video ? "Video" : "Image"} is too large. Maximum size: ${limit} MB. Please compress the file and try again.`));
  return sendUpload(file);
};
