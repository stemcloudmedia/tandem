import { SCSSModule } from "./sandbox";
import { SASS_MIME_TYPE } from "./constants";
import { SandboxModuleFactoryDependency } from "@tandem/sandbox";
import { MimeTypeDependency, CSS_MIME_TYPE } from "@tandem/common";

export const sassExtensionDependencies = [
  new SandboxModuleFactoryDependency(CSS_MIME_TYPE, SASS_MIME_TYPE, SCSSModule),
  new MimeTypeDependency("scss", SASS_MIME_TYPE)
];
