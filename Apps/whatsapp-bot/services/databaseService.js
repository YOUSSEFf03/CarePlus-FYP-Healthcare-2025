const UserQueries = require('../database/queries/users');
const PatientQueries = require('../database/queries/patients');
const AppointmentQueries = require('../database/queries/appointments');
const DoctorQueries = require('../database/queries/doctors');
const SlotQueries = require('../database/queries/slots');

const userExists = async (phone) => {
  const user = await UserQueries.getUserByPhone(phone);
  return !!user;
};

const getPatientByPhone = async (phone) => {
  return await PatientQueries.getPatientByPhone(phone);
};

const createUserAndPatient = async (userData, patientData) => {
  // This would be a transaction in a real implementation
  const user = await UserQueries.createUser(userData);
  const patient = await PatientQueries.createPatient({
    ...patientData,
    userId: user.id
  });
  
  return { user, patient };
};

const getDoctorsByRegion = async (regionId) => {
  return await DoctorQueries.getDoctorsByRegion(regionId);
};

const getDoctorsBySpecialization = async (specialization, regionId) => {
  return await DoctorQueries.getDoctorsBySpecialization(specialization, regionId);
};

const getAvailableSlots = async (doctorId, date) => {
  return await SlotQueries.getAvailableSlots(doctorId, date);
};

const createAppointment = async (appointmentData) => {
  return await AppointmentQueries.createAppointment(appointmentData);
};

const getPatientAppointments = async (patientId) => {
  return await AppointmentQueries.getPatientAppointments(patientId);
};

const cancelAppointment = async (appointmentId) => {
  return await AppointmentQueries.updateAppointmentStatus(appointmentId, 'CANCELLED');
};

const getDoctorById = async (doctorId) => {
  return await DoctorQueries.getDoctorById(doctorId);
};

module.exports = {
  userExists,
  getPatientByPhone,
  createUserAndPatient,
  getDoctorsByRegion,
  getDoctorsBySpecialization,
  getAvailableSlots,
  createAppointment,
  getPatientAppointments,
  cancelAppointment,
  getDoctorById 
};
