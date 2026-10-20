import { api } from "../../../shared/services/api";
import { requireResponseData, type ApiResponse } from "../../../shared/types/api.types";

export interface Attachment {
  id: number;
  filename: string;
  media_type: string;
  size: number;
  created_at: string;
  created_by_name: string;
  is_image: boolean;
}
export interface AttachmentList {
  items: Attachment[];
  can_delete: boolean;
  total_bytes: number;
  max_files: number;
  max_file_bytes: number;
  max_total_bytes: number;
}
const path = (orderId: number) => `/work_orders/${orderId}/attachments`;
export const AttachmentService = {
  async list(orderId: number, signal: AbortSignal) {
    return requireResponseData((await api.get<ApiResponse<AttachmentList>>(path(orderId), { signal })).data);
  },
  async upload(orderId: number, file: File, requestId: string, signal: AbortSignal, progress: (percent: number) => void) {
    const response = await api.post<ApiResponse<Attachment>>(path(orderId), file, {
      params: { filename: file.name }, signal, timeout: 120_000,
      headers: { "Content-Type": "application/octet-stream", "X-Request-ID": requestId },
      onUploadProgress: event => progress(Math.min(100, Math.round(event.loaded / (event.total || file.size) * 100))),
    });
    return requireResponseData(response.data);
  },
  async remove(orderId: number, id: number, signal: AbortSignal) {
    return requireResponseData((await api.delete<ApiResponse<{ deleted: boolean }>>(`${path(orderId)}/${id}`, { signal })).data);
  },
  async content(orderId: number, item: Attachment, thumbnail: boolean, signal: AbortSignal): Promise<Blob> {
    const response = await api.get<unknown>(`${path(orderId)}/${item.id}/content`, {
      params: { thumbnail }, responseType: "blob", signal, timeout: 60_000,
    });
    const expected = thumbnail ? "image/webp" : item.media_type;
    if (response.status !== 200 || !(response.data instanceof Blob) || response.data.type.split(";")[0] !== expected) {
      throw new Error("Não foi possível abrir o anexo. Atualize a lista e tente novamente.");
    }
    return response.data;
  },
};
