import { ServiceBase } from "@workspace/shared/services/service.base";

export type MiddlewareFn<T extends ServiceBase> = (context: T) => Promise<void> | void;

export function UseMiddleware<T extends ServiceBase>(middleware: MiddlewareFn<T>) {
	return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			await middleware(this as T);
			return originalMethod.apply(this, args);
		};

		return descriptor;
	};
}
