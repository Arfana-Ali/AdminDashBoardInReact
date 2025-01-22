import { z } from 'zod'

export const FormDataSchema = z.object({
  vehicleNumber: z.string().min(10, 'Vehicle number is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  ownerPhone: z.string().min(10, 'Phone number is required'),
  selectCities: z.string().min(1, 'City is required'),
  selectEmployee: z.string().min(1, 'Employee is required'),
})