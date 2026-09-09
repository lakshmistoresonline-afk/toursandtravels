import { type ServiceBase } from "@workspace/shared/services/service.base";

export const loggerMiddleware = async (svc: ServiceBase) => {
	console.log(`[SERVICE CALL] ${svc.constructor.name} at ${new Date().toISOString()}`);
};
