import { ServiceBase } from "@workspace/shared/services/service.base";

export type MiddlewareFn<T extends ServiceBase> = (context: T) => Promise<void> | void;

export function UseClassMiddleware<T extends ServiceBase>(...middlewares: MiddlewareFn<T>[]) {
	return function (constructor: Function) {
		const original = constructor.prototype;

		Object.getOwnPropertyNames(original).forEach((propertyName) => {
			const descriptor = Object.getOwnPropertyDescriptor(original, propertyName);
			if (descriptor && typeof descriptor.value === "function" && propertyName !== "constructor") {
				const originalMethod = descriptor.value;
				descriptor.value = async function (...args: any[]) {
					for (const middleware of middlewares) {
						await middleware(this as T);
					}
					return originalMethod.apply(this, args);
				};
				Object.defineProperty(original, propertyName, descriptor);
			}
		});
	};
}
