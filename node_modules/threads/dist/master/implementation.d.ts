import { WorkerImplementation } from "../types/master";
interface ImplementationExports {
    defaultPoolSize: number;
    selectWorkerImplementation(): typeof WorkerImplementation;
}
declare const _default: ImplementationExports;
export default _default;
