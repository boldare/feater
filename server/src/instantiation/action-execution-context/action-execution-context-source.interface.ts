import { ActionExecutionContextBeforeBuildTaskInterface } from './before-build/action-execution-context-before-build-task.interface';
import { SourcePathsInterface } from '../helper/path-helper.component';

export interface ActionExecutionContextSourceInterface {
    id: string;
    cloneUrl: string;
    useDeployKey: boolean;
    reference: {
        type: string;
        name: string;
    };
    paths: SourcePathsInterface;
    dockerVolumeName?: string;
    beforeBuildTasks: ActionExecutionContextBeforeBuildTaskInterface[];
}
