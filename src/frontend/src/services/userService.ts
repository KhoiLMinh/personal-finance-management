import api from "./api";

const userService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: {
    fullName: string;
    avatarFile?: File | null;
  }) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);

    if (data.avatarFile) {
      formData.append("avatar", data.avatarFile);
    }

    const response = await api.patch("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  deleteUser: async (userCode: string) => {
    const response = await api.delete(`/users/${userCode}`);
    return response.data;
  },

  toggleUserStatus: async (userCode: string) => {
    const response = await api.patch(`/users/${userCode}/toggle-status`);
    return response.data;
  },
};

export default userService;
