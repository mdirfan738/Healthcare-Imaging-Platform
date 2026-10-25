import axiosClient from './axiosClient';

export const imagesApi = {
  upload: (seriesId: string, studyId: string, file: File) => {
    const formData = new FormData();
    formData.append('seriesId', seriesId);
    formData.append('studyId', studyId);
    formData.append('file', file);
    return axiosClient.post('/images/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  download: (imageId: string) => axiosClient.get(`/images/${imageId}/download`, { responseType: 'blob' }),
  search: (params: Record<string, unknown>) => axiosClient.get('/images', { params }),
};
