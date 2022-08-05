import { map } from 'rxjs/operators';

export const environment = {
  production: true,

    firebaseConfig : {
    apiKey: "AIzaSyAxMfMkkeKntFUUYbRfPRJ0KllR2MzIQo4",
    authDomain: "appmarket-68601.firebaseapp.com",
    projectId: "appmarket-68601",
    storageBucket: "appmarket-68601.appspot.com",
    messagingSenderId: "157223563753",
    appId: "1:157223563753:web:d8879df1bdb71600ce9b78"
    },
    uidAdmin: 'BHUaG3UA9PSNfXqKHlBHyCovLAG3',
  isAdmin: (next: any) => map( (user: any) => !!user), 

/*   firebaseConfig: {
    apiKey: "AIzaSyCX0mKIQO7uX7ZWPWf7p1s4yIV5eyGjk50",
    authDomain: "minimarket-2b16d.firebaseapp.com",
    projectId: "minimarket-2b16d",
    storageBucket: "minimarket-2b16d.appspot.com",
    messagingSenderId: "570703035035",
    appId: "1:570703035035:web:0966877c72f99327f7a43e"  
  },
  uidAdmin: 'dtQ2OsjRn8V4T3HR52brswcQeRb2',
  isAdmin: (next: any) => map( (user: any) => !!user), */
};

// export const environment = {
//   production: false,
//   firebaseConfig: {
//     apiKey: "AIzaSyB2r3pO1Fk6NUQPVlBTKcBUwcjv-gsRCXE",
//     authDomain: "tutiendademo.firebaseapp.com",
//     projectId: "tutiendademo",
//     storageBucket: "tutiendademo.appspot.com",
//     messagingSenderId: "622369298288",
//     appId: "1:622369298288:web:e108c26a4fa482b92721b5",
//     measurementId: "G-PNZH2ZM1BE"
//   },
//   uidAdmin: 'kCi2EbsCT0NnNy5YBHczI0NVtuZ2',
//   isAdmin: (next: any) => map( (user: any) => !!user),
  
// };

