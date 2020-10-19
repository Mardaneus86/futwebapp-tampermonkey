export class SBC {
  static getSBCController() {
    return getAppMain().getRootViewController().getPresentedViewController()
      .getCurrentViewController()
      .getCurrentController()._leftController;
  }
}
