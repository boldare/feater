import {Component, Inject} from '@nestjs/common';
import {GraphQLSchema} from 'graphql';
import * as GraphQLJSON from 'graphql-type-json';
import {makeExecutableSchema} from 'graphql-tools';
import {ProjectTypeInterface} from '../type/project-type.interface';
import {DefinitionTypeInterface} from '../type/definition-type.interface';
import {InstanceTypeInterface} from '../type/instance-type.interface';
import {ProjectsResolverFactory} from '../resolver/projects-resolver-factory.component';
import {DefinitionResolverFactory} from '../resolver/definition-resolver-factory.component';
import {InstanceResolverFactory} from '../resolver/instance-resolver-factory.component';
import {BeforeBuildTaskTypeInterface} from '../type/nested/definition-config/before-build-task-type.interface';
import {UsersResolverFactory} from '../resolver/users-resolver-factory.component';
import {DateResolverFactory} from '../resolver/date-resolver-factory.component';
import {LogsResolverFactory} from '../resolver/logs-resolver-factory.component';
import {LogTypeInterface} from '../type/log-type.interface';
import {DockerDaemonResolverFactory} from '../resolver/docker-daemon-resolver-factory.component';
import {AfterBuildTaskTypeInterface} from '../type/nested/definition-config/after-build-task-type.interface';
import {AssetResolverFactory} from '../resolver/asset-resolver-factory.component';
import {AssetTypeInterface} from '../type/asset-type.interface';

@Component()
export class GraphqlSchemaFactory {
    constructor(
        @Inject('TypeDefsProvider') private readonly typeDefsProvider,
        private readonly usersResolverFactory: UsersResolverFactory,
        private readonly projectsResolverFactory: ProjectsResolverFactory,
        private readonly definitionResolverFactory: DefinitionResolverFactory,
        private readonly instanceResolverFactory: InstanceResolverFactory,
        private readonly assetResolverFactory: AssetResolverFactory,
        private readonly logsResolverFactory: LogsResolverFactory,
        private readonly dateResolverFactory: DateResolverFactory,
        private readonly dockerDaemonResolverFactory: DockerDaemonResolverFactory,
    ) { }

    public createSchema(): GraphQLSchema {
        return makeExecutableSchema({
            typeDefs: this.typeDefsProvider,
            resolvers: this.createResolvers(),
        });
    }

    protected createResolvers(): any {
        return {
            JSON: GraphQLJSON,

            Query: {
                users: this.usersResolverFactory.getListResolver(),
                projects: this.projectsResolverFactory.getListResolver(),
                project: this.projectsResolverFactory.getItemResolver(
                    (obj: any, args: any): string => args.id,
                ),
                definitions: this.definitionResolverFactory.getListResolver(),
                definition: this.definitionResolverFactory.getItemResolver(
                    (obj: any, args: any): string => args.id,
                ),
                instances: this.instanceResolverFactory.getListResolver(),
                instance: this.instanceResolverFactory.getItemResolver(
                    (obj: any, args: any): string => args.id,
                ),
                asset: this.assetResolverFactory.getItemResolver(
                    (obj: any, args: any): string => args.id,
                ),
            },

            Mutation: {
                createProject: this.projectsResolverFactory.getCreateItemResolver(),
                createDefinition: this.definitionResolverFactory.getCreateItemResolver(),
                createInstance: this.instanceResolverFactory.getCreateItemResolver(),
                removeInstance: this.instanceResolverFactory.getRemoveItemResolver(),
                stopService: this.instanceResolverFactory.getStopItemServiceResolver(),
                pauseService: this.instanceResolverFactory.getPauseItemServiceResolver(),
                startService: this.instanceResolverFactory.getStartItemServiceResolver(),
                unpauseService: this.instanceResolverFactory.getUnpauseItemServiceResolver(),
                createAsset: this.assetResolverFactory.getCreateItemResolver(),
            },

            Project: {
                definitions: this.definitionResolverFactory.getListResolver(
                    (project: ProjectTypeInterface) => ({projectId: project.id.toString()}),
                ),
                assets: this.assetResolverFactory.getListResolver(
                    (project: ProjectTypeInterface) => ({
                        projectId: project.id,
                        uploaded: true,
                    }),
                ),
            },

            Definition: {
                project: this.projectsResolverFactory.getItemResolver(
                    (definition: DefinitionTypeInterface) => definition.projectId,
                ),
                instances: this.instanceResolverFactory.getListResolver(
                    (definition: DefinitionTypeInterface) => ({definitionId: definition.id.toString()}),
                ),
                configAsYaml: this.definitionResolverFactory.getConfigAsYamlResolver(),
                deployKeys: this.definitionResolverFactory.getDeployKeysResolver(),
            },

            Instance: {
                definition: this.definitionResolverFactory.getItemResolver(
                    (instance: InstanceTypeInterface) => instance.definitionId,
                ),
                createdAt: this.dateResolverFactory.getDateResolver(
                    (instance: InstanceTypeInterface) => instance.createdAt,
                ),
                logs: this.logsResolverFactory.getListResolver(
                    (instance: InstanceTypeInterface) => ({instanceId: instance.id.toString()}),
                ),
            },

            InstanceService: {
                containerState: this.dockerDaemonResolverFactory.getContainerStateResolver(
                    (instanceService: any) => instanceService.containerNamePrefix,
                ),
            },

            InstanceLog: {
                createdAt: this.dateResolverFactory.getDateResolver(
                    (log: LogTypeInterface) => log.createdAt,
                ),
            },

            BeforeBuildTask: {
                __resolveType: (beforeBuildTask: BeforeBuildTaskTypeInterface): string => {
                    if ('copy' === beforeBuildTask.type) {
                        return 'CopyBeforeBuildTask';
                    }
                    if ('interpolate' === beforeBuildTask.type) {
                        return 'InterpolateBeforeBuildTask';
                    }
                    throw new Error();
                },
            },

            AfterBuildTask: {
                __resolveType: (afterBuildTask: AfterBuildTaskTypeInterface): string => {
                    switch (afterBuildTask.type) {
                        case 'executeHostCommand':
                            return 'ExecuteHostCommandAfterBuildTask';

                        case 'executeServiceCommand':
                            return 'ExecuteServiceCommandAfterBuildTask';

                        case 'copyAssetIntoContainer':
                            return 'CopyAssetIntoContainerAfterBuildTask';
                    }

                    throw new Error();
                },
            },

            Asset: {
                project: this.projectsResolverFactory.getItemResolver(
                    (asset: AssetTypeInterface) => asset.projectId,
                ),
                createdAt: this.dateResolverFactory.getDateResolver(
                    (asset: AssetTypeInterface) => asset.createdAt,
                ),
            },
        };
    }
}
