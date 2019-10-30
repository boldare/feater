import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { NgxSpinnerService } from 'ngx-spinner';
import { InstanceAddForm } from './instance-add-form.model';
import {
    GetDefinitionQueryDefinitionFieldInterface,
    GetDefinitionQueryInterface,
    getDefinitionQueryGql,
} from './get-definition.query';
import { ToastrService } from 'ngx-toastr';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

interface InstantiationAction {
    id: string;
    name: string;
    type: string;
}

@Component({
    selector: 'app-instance-add',
    templateUrl: './instance-add.component.html',
    styles: [],
})
export class InstanceAddComponent implements OnInit {
    instance: InstanceAddForm;

    definition: GetDefinitionQueryDefinitionFieldInterface;

    instantiationActions: InstantiationAction[] = [];

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected apollo: Apollo,
        protected spinner: NgxSpinnerService,
        protected toastr: ToastrService,
    ) {
        this.instance = {
            name: '',
        };
    }

    ngOnInit() {
        this.getDefinition();
    }

    createInstance(instantiationActionId: string) {
        this.spinner.show();
        this.apollo
            .mutate({
                mutation: gql`
                    ${this.getCreateInstanceMutation(instantiationActionId)}
                `,
            })
            .subscribe(
                ({ data }) => {
                    this.spinner.hide();
                    this.toastr.success(
                        `Creation of instance <em>${data.createInstance.name}</em> started.`,
                    );
                    this.router.navigate(['/instance', data.createInstance.id]);
                },
                () => {
                    this.toastr.error(
                        `Failed to create instance <em>${this.instance.name}</em>.`,
                    );
                    this.spinner.hide();
                },
            );
    }

    protected getDefinition() {
        this.spinner.show();
        this.apollo
            .watchQuery<GetDefinitionQueryInterface>({
                query: getDefinitionQueryGql,
                variables: {
                    id: this.route.snapshot.params['id'],
                },
            })
            .valueChanges.subscribe(result => {
                const resultData: GetDefinitionQueryInterface = result.data;
                this.definition = resultData.definition;
                this.instantiationActions = this.definition.actions.filter(
                    action => 'instantiation' === action.type,
                );
                this.spinner.hide();
            });
    }

    protected getCreateInstanceMutation(instantiationActionId: string): string {
        const jsonQuery = {
            mutation: {
                createInstance: {
                    __args: {
                        definitionId: this.definition.id,
                        instantiationActionId,
                        name: this.instance.name,
                    },
                    id: true,
                    name: true,
                },
            },
        };

        return jsonToGraphQLQuery(jsonQuery);
    }
}
