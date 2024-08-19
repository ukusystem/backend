import { ControllerState, UpdateControllerStateFunction } from "./controller.state.types";

export class ControllerStateUpdate {
    static #functions: { [P in keyof ControllerState]: UpdateControllerStateFunction<P>  } = {

    }

    static getFunction<T extends keyof ControllerState>( keyConfig: T ): ( currentConfig: ControllerState, newValue: ControllerState[T], ctrl_id: number ) => void {
        return ControllerStateUpdate.#functions[keyConfig];
    }
}