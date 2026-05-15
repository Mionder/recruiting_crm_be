import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'diqmtzr5v',
      api_key: '423286886422473',
      api_secret: 'BQPJLF-H0z6K29O9drVW0PwpBcE',
    });
  },
};

//DB User - recruiting1159_db_user
//DB password - lcVunabxhmk99i3q
