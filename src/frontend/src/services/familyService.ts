import api from './api';

const familyService = {
  createFamily: async (data: { name: string }) => {
    const response = await api.post('/families', data);
    return response.data;
  },

  getMyFamily: async () => {
    const response = await api.get('/families/me');
    return response.data;
  },

  joinFamily: async (data: { inviteCode: string }) => {
    const response = await api.post('/families/join', data);
    return response.data;
  },

  leaveFamily: async () => {
    const response = await api.delete('/families/leave');
    return response.data;
  },

  getMembers: async (familyId: number, params?: any) => {
    const response = await api.get(`/families/${familyId}/members`, { params });
    return response.data;
  },

  updateMemberRole: async (familyId: number, memberId: number, data: { role: string }) => {
    const response = await api.patch(`/families/${familyId}/members/${memberId}/role`, data);
    return response.data;
  },

  removeMember: async (familyId: number, memberId: number) => {
    const response = await api.delete(`/families/${familyId}/members/${memberId}`);
    return response.data;
  },

  regenerateInviteCode: async (familyId: number) => {
    const response = await api.post(`/families/${familyId}/invite-code/regenerate`);
    return response.data;
  },

  deleteFamily: async (familyId: number) => {
    const response = await api.delete(`/families/${familyId}`);
    return response.data;
  }
};

export default familyService;