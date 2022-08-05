import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection, 
  AngularFirestoreCollectionGroup} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(public FireStore: AngularFirestore) { 
      this.FireStore.firestore.disableNetwork();
  }

  getCollectionChanges<tipo>(path: string): Observable<tipo[]> {
      const itemsCollection: AngularFirestoreCollection<tipo> =
                        this.FireStore.collection<tipo>(path);
      return itemsCollection.valueChanges();
  }

  async getDocument<tipo>(enlace: string) {
      await this.FireStore.firestore.enableNetwork();
      const itemDoc: AngularFirestoreDocument<tipo> = this.FireStore.doc<tipo>(enlace);
      return itemDoc.ref.get();
  }

  async getCollection<tipo>(path: string) {
    await this.FireStore.firestore.enableNetwork();
    const itemsCollection: AngularFirestoreCollection<tipo> =
                      this.FireStore.collection<tipo>(path);
    return itemsCollection.ref.get();
  }

  getDocumentChanges <tipo>(enlace: string): Observable<tipo> {
    const itemDoc: AngularFirestoreDocument<tipo> = this.FireStore.doc<tipo>(enlace);
    return itemDoc.valueChanges();
  }

  getDocumentFromCache<tipo>(enlace: string): Promise<tipo | null> {
    return new Promise( async (resolve) => {
          await this.FireStore.firestore.disableNetwork();
          this.getDocument<tipo>(enlace).then( async doc => {
                if (doc.exists) {
                  console.log('get from cache');
                  resolve(doc.data());
                  return;
                } 
                else {
                  console.log('TTTTtrying to get doc from server');
                   await this.FireStore.firestore.enableNetwork();
                   this.getDocument<tipo>(enlace).then( docServer => {
                      if (docServer.exists) {
                        resolve(docServer.data());
                      } else {
                        resolve(null);
                      }
                   }).catch ( () => {
                        console.log('sin conexion');
                        resolve(null);
                   })
                }
          }).catch( async () => {
              console.log('trying to get doc from server');
              await this.FireStore.firestore.enableNetwork();
                  this.getDocument<tipo>(enlace).then( docServer => {
                    if (docServer.exists) {
                      console.log('get doc from server');
                      resolve(docServer.data());
                    } else {
                      console.log('no existe doc');
                      resolve(null);
                    }
                  }).catch( () => {
                      resolve(null);
                      console.log('sin conexion');
                  });
          })

    });
  }

  getCollectionFromCache<tipo>(enlace: string): Promise<tipo[] | null>  {
    return new Promise( async (resolve) => {
      await this.FireStore.firestore.disableNetwork();
      this.getCollection<tipo>(enlace).then( async docs => {
            if (!docs.empty) {
              console.log('get Collection from cache');
              const collection: tipo[] = [];
              docs.docs.forEach( doc => {
                 collection.push(doc.data());
              })
              resolve(collection);
              return;
            } else {

              console.log('!docs.empty -> trying to get Collection from server');
               await this.FireStore.firestore.enableNetwork();
               this.getCollection<tipo>(enlace).then( docsServer => {
                  if (docsServer.empty) {
                    console.log('no existe Collection');
                    resolve(null);
                  } else {
                    console.log('get Collection from server');
                    const collection: tipo[] = [];
                    docsServer.docs.forEach( doc => {
                       collection.push(doc.data());
                    })
                    resolve(collection);
                  }
               });

            }
      }).catch( async () => {
          console.log('trying to get Collection from server');
          await this.FireStore.firestore.enableNetwork();
          this.getCollection<tipo>(enlace).then( docsServer => {
            if (docsServer.empty) {
              console.log('no existe Collection');
              resolve(null);
            } else {
              console.log('get Collection from server');
              const collection: tipo[] = [];
              docsServer.docs.forEach( doc => {
                  collection.push(doc.data());
              })
              resolve(collection);
            }
          });
      })

});
  }

  createDocument<tipo>(data: tipo, enlace: string) {
    const itemsCollection: AngularFirestoreCollection<tipo> =
                      this.FireStore.collection<tipo>(enlace);
    return itemsCollection.add(data);
  }

  async createDocumentID <tipo>(data: tipo, enlace: string, idDoc: string) {
    await this.FireStore.firestore.enableNetwork();
    const itemsCollection: AngularFirestoreCollection<tipo> =
                          this.FireStore.collection<tipo>(enlace);
    return itemsCollection.doc(idDoc).set(data);
  }

  async updateDocumentID <tipo>(data: tipo, enlace: string, idDoc: string) {
    await this.FireStore.firestore.enableNetwork();
    const itemsCollection: AngularFirestoreCollection<tipo> =
                          this.FireStore.collection<tipo>(enlace);
    return itemsCollection.doc(idDoc).update(data);
  }

  createIdDoc(): string {
    return this.FireStore.createId();
  }

  deleteDocumentID(enlace: string, idDoc: string) {
    const itemsCollection: AngularFirestoreCollection =
                          this.FireStore.collection(enlace);
    return itemsCollection.doc(idDoc).delete();
  }

  getCollectionQuery<tipo>(path: string, parametro: string, busqueda: any): Observable<tipo[]> {
    const itemsCollection: AngularFirestoreCollection<tipo> =
                      this.FireStore.collection<tipo>(path
                         , ref => ref.where (parametro, '==', busqueda));
    return itemsCollection.valueChanges();
  }

  getCollectionOrderLimit<tipo>(path: string, LIMIT: number, orderId: string, directionSort: 'asc' | 'desc',
                                STARTAT?: any): Observable<tipo[]> {
    if (STARTAT === null) {
      const itemsCollection: AngularFirestoreCollection<tipo> =
                        this.FireStore.collection<tipo>(path
                           , ref => ref.orderBy(orderId, directionSort)
                                       .limit(LIMIT));
      return itemsCollection.valueChanges();
    } else {
      const itemsCollection: AngularFirestoreCollection<tipo> =
      this.FireStore.collection<tipo>(path
         , ref => ref.orderBy(orderId, directionSort)
                     .startAfter(STARTAT).limit(LIMIT));
      return itemsCollection.valueChanges();
    }
  }

  getCollectionQueryOrderLimit<tipo>(path: string, parametro: string, busqueda: any,
                                     LIMIT: number, orderId: string, directionSort: 'asc' | 'desc',
                                     STARTAT?: any): Observable<tipo[]> {
      if (STARTAT === null) {
          const itemsCollection: AngularFirestoreCollection<tipo> =
          this.FireStore.collection<tipo>(path
                  , ref => ref.where(parametro, '==', busqueda)
                          .orderBy(orderId, directionSort)
                          .limit(LIMIT));
          return itemsCollection.valueChanges();
      } else {
          const itemsCollection: AngularFirestoreCollection<tipo> =
          this.FireStore.collection<tipo>(path
          , ref => ref.where(parametro, '==', busqueda)
                      .orderBy(orderId, directionSort)
                      .startAfter(STARTAT).limit(LIMIT));
          return itemsCollection.valueChanges();
      }
  }


}
