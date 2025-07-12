import axios from '@/lib/axios';

export const masterDataService = {
  // Education Levels
  getEducationLevels() {
    return axios.get('/education-levels');
  },

  getEducationLevelById(id) {
    return axios.get(`/education-levels/${id}`);
  },

  createEducationLevel(data) {
    return axios.post('/education-levels', data);
  },

  updateEducationLevel(id, data) {
    return axios.put(`/education-levels/${id}`, data);
  },

  deleteEducationLevel(id) {
    return axios.delete(`/education-levels/${id}`);
  },

  // Subjects
  getSubjects(params = {}) {
    return axios.get('/subjects', { params });
  },

  getSubjectById(id) {
    return axios.get(`/subjects/${id}`);
  },

  createSubject(data) {
    return axios.post('/subjects', data);
  },

  updateSubject(id, data) {
    return axios.put(`/subjects/${id}`, data);
  },

  deleteSubject(id) {
    return axios.delete(`/subjects/${id}`);
  },

  getSubjectsByEducationLevel(educationLevelId) {
    return axios.get(`/subjects/education-level/${educationLevelId}`);
  },

  searchSubjects(query) {
    return axios.get('/subjects/search', { params: { name: query } });
  },

  // Locations
  getAllLocations() {
    return axios.get('/locations/all');
  },

  getLocationById(id) {
    return axios.get(`/locations/${id}`);
  },

  createLocation(data) {
    return axios.post('/locations', data);
  },

  updateLocation(id, data) {
    return axios.put(`/locations/${id}`, data);
  },

  deleteLocation(id) {
    return axios.delete(`/locations/${id}`);
  },

  async getProvinces() {
    try {
      const response = await axios.get('/locations/provinces');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCities(provinceId) {
    try {
      const response = await axios.get(
        `/locations/cities?province_id=${provinceId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getDistricts(cityId) {
    try {
      const response = await axios.get(
        `/locations/districts?city_id=${cityId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getVillages(districtId) {
    try {
      const response = await axios.get(
        `/locations/villages?district_id=${districtId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createLocation(locationData) {
    try {
      const response = await axios.post('/locations', locationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Teacher Qualifications
  getTeacherQualifications() {
    return axios.get('/teacher-qualifications');
  },

  getTeacherQualificationsByTeacher(teacherId) {
    return axios.get(`/teacher-qualifications/teacher/${teacherId}`);
  },

  getTeachersByEducationLevel(educationLevelId) {
    return axios.get(
      `/teacher-qualifications/education-level/${educationLevelId}`
    );
  },

  getTeachersBySubject(subjectId) {
    return axios.get(`/teacher-qualifications/subject/${subjectId}`);
  },

  assignEducationLevelsToTeacher(teacherId, educationLevelIds) {
    return axios.post(
      `/teacher-qualifications/teacher/${teacherId}/education-levels`,
      {
        education_level_ids: educationLevelIds,
      }
    );
  },

  assignSubjectsToTeacher(teacherId, subjectIds) {
    return axios.post(`/teacher-qualifications/teacher/${teacherId}/subjects`, {
      subject_ids: subjectIds,
    });
  },

  removeQualificationFromTeacher(teacherId, educationLevelId) {
    return axios.delete(
      `/teacher-qualifications/teacher/${teacherId}/education_level/${educationLevelId}`
    );
  },

  getMyQualifications() {
    return axios.get('/teacher-qualifications/my');
  },

  // Teacher Availability
  getAllTeacherAvailabilities() {
    return axios.get('/teacher-availabilities/all');
  },

  getMyAvailabilities() {
    return axios.get('/teacher-availabilities/my');
  },

  getAvailableTeachersForLocation(locationId, isAvailable = true) {
    return axios.get('/teacher-availabilities/available-teachers', {
      params: { location_id: locationId, is_available: isAvailable },
    });
  },

  getTeacherAvailabilityById(id) {
    return axios.get(`/teacher-availabilities/${id}`);
  },

  createTeacherAvailability(data) {
    return axios.post('/teacher-availabilities', data);
  },

  updateTeacherAvailability(id, data) {
    return axios.put(`/teacher-availabilities/${id}`, data);
  },

  deleteTeacherAvailability(id) {
    return axios.delete(`/teacher-availabilities/${id}`);
  },
};
