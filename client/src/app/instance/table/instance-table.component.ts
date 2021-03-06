import { Component, Input } from '@angular/core';
import { GetInstanceListQueryInstanceFieldItemInterface } from '../list/get-instance-list.query';

@Component({
    selector: 'app-instance-table',
    templateUrl: './instance-table.component.html',
    styles: [],
})
export class InstanceTableComponent {
    @Input() instances: GetInstanceListQueryInstanceFieldItemInterface[];

    @Input() withProjects = true;
    @Input() withDefinitions = true;

    search: string;

    getRunningServicesCount(services: { containerState: string }[]): number {
        return services.filter(service => 'running' === service.containerState)
            .length;
    }

    getFilterCondition() {
        return {
            $or: [
                { name: this.search },
                { hash: this.search },
                { definition: { name: this.search } },
                { definition: { project: { name: this.search } } },
            ],
        };
    }
}
