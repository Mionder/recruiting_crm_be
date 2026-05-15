import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  twoFactorSecret: string; // Секретний ключ для Google Authenticator

  @Prop({ default: false })
  isTwoFactorEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);