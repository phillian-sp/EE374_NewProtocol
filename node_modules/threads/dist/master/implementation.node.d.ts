import { WorkerImplementation } from "../types/master";
declare function selectWorkerImplementation(): typeof WorkerImplementation;
declare const _default: {
    defaultPoolSize: number;
    selectWorkerImplementation: typeof selectWorkerImplementation;
};
export default _default;
