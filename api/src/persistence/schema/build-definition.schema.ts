import { Schema } from 'mongoose';

export const BuildDefinitionSchema = new Schema({
    projectId: String,
    name: String,
});
