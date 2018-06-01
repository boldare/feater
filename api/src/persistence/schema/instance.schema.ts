import {Schema} from 'mongoose';

const SummaryItemSchema = new Schema({
    name: String,
    value: String,
});

const EnvironmentalVariableSchema = new Schema({
    key: String,
    value: String,
});

export const InstanceSchema = new Schema({
    definitionId: String,
    hash: String,
    name: String,
    config: Schema.Types.Mixed,
    services: Schema.Types.Mixed,
    summaryItems: [SummaryItemSchema],
    environmentalVariables: [EnvironmentalVariableSchema],
});
