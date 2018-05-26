import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as jsYaml from 'js-yaml';
import {Component} from '@nestjs/common';
import {JobLoggerFactory} from '../../logger/job-logger-factory';
import {BuildInstanceRepository} from '../../persistence/repository/build-instance.repository';
import {JobInterface, BuildJobInterface} from './job';
import {JobExecutorInterface} from './job-executor';

export class ParseDockerComposeJob implements BuildJobInterface {

    constructor(
        readonly build: any,
    ) {}

}

@Component()
export class ParseDockerComposeJobExecutor implements JobExecutorInterface {

    constructor(
        private readonly jobLoggerFactory: JobLoggerFactory,
        private readonly buildInstanceRepository: BuildInstanceRepository,
    ) {}

    supports(job: JobInterface): boolean {
        return (job instanceof ParseDockerComposeJob);
    }

    execute(job: JobInterface, data: any): Promise<any> {
        if (!this.supports(job)) {
            throw new Error();
        }

        const buildJob = job as ParseDockerComposeJob;
        const logger = this.jobLoggerFactory.createForBuildJob(buildJob);
        const { build } = buildJob;

        return new Promise(resolve => {
            logger.info('Parsing compose file.');

            const absoluteDir = path.join(
                build.sources[build.config.composeFile.sourceId].fullBuildPath,
                path.dirname(build.config.composeFile.relativePath),
            );
            const basename = path.basename(build.config.composeFile.relativePath);

            build.compose = jsYaml.safeLoad(
                fs.readFileSync(path.join(absoluteDir, basename)).toString(),
            );
            logger.debug('Compose file parsed to Yaml.', {dockerComposeYaml: JSON.stringify(build.compose)});

            build.composeProjectName = `featbuild${build.hash}`;

            build.services = {};
            _.each(
                build.compose.services,
                (service, id) => {
                    // Keep only letters, digits and hyphens in clean name for domains.
                    // Replace other characters with hyphens.

                    build.services[id] = {
                        id,
                        cleanId: id.replace(/[^a-zA-Z\d-]/g, '-').toLowerCase(),
                        containerNamePrefix: `${build.composeProjectName}_${id}`,
                        exposedPorts: [],
                    };
                },
            );
            logger.debug('Services found in compose file.', {dockerComposeServices: JSON.stringify(build.services)});

            this.buildInstanceRepository.updateServices(build);

            resolve();

        });
    }

}
