export class CameraForFront {
  readonly cameraIP: string|null;
  readonly cameraID: number;
  readonly controllerID: number;
  readonly user: string|null;
  password: string | null;

  constructor(cameraID: number, controllerID: number, cameraIP: string|null = null, user: string|null = null, password: string | null = null) {
    this.cameraID = cameraID;
    this.cameraIP = cameraIP;
    this.controllerID = controllerID;
    this.user = user;
    this.password = password;
  }
}
