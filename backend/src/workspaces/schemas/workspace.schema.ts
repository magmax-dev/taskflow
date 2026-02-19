import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ default: '', maxlength: 500 })
  description: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
