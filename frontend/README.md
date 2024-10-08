## Tweetflow


Currently i am running both the django server in the backend and the react vite in the frontend and they are both running using https the ssl certificate.

If you happen to land on this first you will need to create or update a folder in the root dir containing the ./frontend and ./backend folders among, in the dir you should create a certificates folder, and in it you should put your .pem cerficate files in there. 

- Note that the vite and django configurations are both using the certificate for flexibilty and also when creating the certificate please use `localhost` instead of `127.0.0.1`.

- Note that if you later choose to relocate the certificate files you must update their path in the `vite.config.js` file and also in the `run_ssl.py` file located in the backend where the django `manage.py` file is located and the `.env` file in the backend folder

To run vite is simple just use the `npm run dev` command
To run django instead of the native `python manage.py runserver` run `python run_ssl.py` as the config has been changed. PS: Its the same thing i just moved the runserver cmd to the  `run_ssl.py` file so i do not have to run the long command that includes the runserver command and the path of the ssl cert

## The enviroment variables are as follows for each folder in the root dir
- for the frontend its 
```env
VITE_BACKEND_SERVER_URL 
VITE_CONVERTER_SERVER_URL 

HTTPS=true 
SSL_CRT_FILE
SSL_KEY_FILE

```

- for the backend its 
```env
B2_APPLICATION_KEY
B2_APPLICATION_KEY_ID
B2_BUCKET_NAME
```

- for the converter its 
```env
B2_APPLICATION_KEY
B2_APPLICATION_KEY_ID
B2_BUCKET_NAME
```