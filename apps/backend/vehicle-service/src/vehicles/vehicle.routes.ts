import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { 
  validateRequest, 
  validateQuery,
  createVehicleSchema, 
  updateVehicleSchema,
  vehicleQuerySchema 
} from './vehicle.validation';

const router = Router();
const vehicleController = new VehicleController();

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles with pagination and filtering
 * @access  Public
 * @query   page, limit, brand, model, year, fuelType, transmission, condition, status, minPrice, maxPrice, search
 */
router.get(
  '/',
  validateQuery(vehicleQuerySchema),
  vehicleController.getAllVehicles
);

/**
 * @route   GET /api/vehicles/stats
 * @desc    Get vehicle statistics
 * @access  Public
 */
router.get('/stats', vehicleController.getVehicleStats);

/**
 * @route   GET /api/vehicles/user/:userId
 * @desc    Get vehicles by user ID
 * @access  Public (but typically would require auth to match user)
 */
router.get(
  '/user/:userId',
  validateQuery(vehicleQuerySchema),
  vehicleController.getUserVehicles
);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get vehicle by ID
 * @access  Public
 */
router.get('/:id', vehicleController.getVehicleById);

/**
 * @route   POST /api/vehicles
 * @desc    Create a new vehicle
 * @access  Private (requires authentication)
 * @body    title, description, brand, model, year, mileage, fuelType, transmission, condition, reservePrice, images
 */
router.post(
  '/',
  validateRequest(createVehicleSchema),
  vehicleController.createVehicle
);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update vehicle by ID
 * @access  Private (requires authentication and ownership)
 * @body    title, description, brand, model, year, mileage, fuelType, transmission, condition, status, reservePrice, images
 */
router.put(
  '/:id',
  validateRequest(updateVehicleSchema),
  vehicleController.updateVehicle
);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete vehicle by ID
 * @access  Private (requires authentication and ownership)
 */
router.delete('/:id', vehicleController.deleteVehicle);

export default router;