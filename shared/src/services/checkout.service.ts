import { Service } from "@workspace/shared/services/service.base";
import { UseClassMiddleware } from "@workspace/shared/decorators/useClassMiddleware";
import { loggerMiddleware } from "@workspace/shared/middlewares/logger.middleware";

@UseClassMiddleware(loggerMiddleware)
export class CheckoutService extends Service {
	/**
	 * REFACTORED: Checkout service is disabled in Simple Tour Management mode.
	 * Registrations are handled directly via BookingService.createRegistration.
	 */
	async confirmCheckout(_input: any) {
		return { success: false, error: "Legacy checkout disabled. Use direct registration." };
	}

	async resumePayment(_bookingRef: string) {
		return { error: "Legacy payments disabled." };
	}

	async refundPayment(_data: any) {
		return { success: false, error: "Refunds not supported in current mode." };
	}
}
