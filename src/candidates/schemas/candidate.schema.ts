import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Candidate extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  ipn: string;

  @Prop()
  birthDate: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  education: string;

  @Prop()
  experience: string;

  @Prop([String])
  categories: string[];

  @Prop()
  healthIssues: string;

  @Prop({ default: false })
  hasCriminal: boolean;

  @Prop()
  criminalDetails: string;

  // Сюди будемо зберігати лінки з Cloudinary
  @Prop()
  photoUrl: string;

  @Prop()
  vlkDocUrl: string;

  @Prop()
  summary: string;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);