import { ServiceBase } from "@workspace/shared/services/service.base";

export type MiddlewareFn<T extends ServiceBase> = (context: T) => Promise<void> | void;

export function asServiceMiddleware<T extends ServiceBase>(fn: MiddlewareFn<T>): MiddlewareFn<T> {
	return fn;
}
