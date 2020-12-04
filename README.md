# Node-Gr
`Node-Gr is a node js MEAN stack framework uses [Typescript](https://www.typescriptlang.org) as a main programing language.
we provide a set of [Typescript](https://www.typescriptlang.org) decorators that will help you configure your project as you need.

These decorators are the core of `Node-Gr` however no actual request or data is handled by us.

As mentioned above this is a mean stack framework witch means that we use
 [express js](https://expressjs.com/) for all request handling and so would a `Node-Gr` user.
 We also support using a [Mongo DB](https://www.mongodb.com/) database for now by integrating [mongoose](https://mongoosejs.com/)
to be used directly with our annotations.

## Concepts

the next chapter will  introduce the concepts that are used and introduced to a
node.js based application.

### Application server:
This is a uniq class (usually called Server) that extends `GrApplicationServer` and is
decorated with `@GrServer` this annotation requires a [modules](#modules) array that define the 
entry point of the whole application. It can also accept a `mongoUrl` which is the Url
to connect to your running mongoDb server. this parameter is optional and if not provided
no database connection will be made.

Another optional parameter is `handleAppCreated` that is a callback that once provided will be called once the
express Application is first created, the application instance will be passed to the callback as a parameter for further custom configuration.
``` typescript
const MONGO_URL = `mongodb://${ Environment.MONGO_SERVER_ADDRESS }:${ Environment.MONGO_SERVER_PORT }/${ Environment.MONGO_DATABASE_NAME }`;

@GRServer({
  modules: [ MainModule ],
  mongoUrl: MONGO_URL,
  handleAppCreated: (app) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
  }
})
export class Server extends GrApplicationServer {
}
```
An Application Server can and should only be created once.

### Modules
`Nde-Gr` uses the well proven concept of modular development, (same as angular modules).
a module can be any typescript class that has the decorator `@GRModule`.
A module is the entry point of a logic section of your application it gives the
possibility to define and import other logical parts and classes of your app.
the `GrModule` decorator accepts: 
* modules?: an optional array og other [modules](#modules) to be imported and used internally. used to reimport reusable modules that
can be useful in multiple logical parts of the app.
* controllers?: an optional array of [controllers](#controllers) to be defined. each one can only be defined in one module.
* interceptors?: an optional array of [interceptors](#interceptors) to be defined. each one can only be defined in one module.
* services?: an optional array of [services](#services) to be defined. each one can only be defined in one module.
* entities?: an optional array of [entities](#entities) to be defined. each entity can only be defined in one module.

the entry point modules of the application, (a module that is not imported in any other module) must be defined in the
 [Application Server](#application-server) in order to be created.
 
``` typescript
@GRModule({
  modules: [ SecondModule, EntitiesModule ],
  controllers: [ CrudController ],
  interceptors: [ MainInterceptor ],
  services: [ AuthService ]
})
export class MainModule {
}
```
 
### Controllers
A controller is a Typescript class that extends `Controller` and is decorated with `@GRController` 
the decorator accepts an optional base bath that will be prefixed for all defined requests in that controller.

A controller is the only place to define Http requests, the definitions are simple public methods
that has the exact same signature as [express js](https://expressjs.com/) http request definition.
a request definition must be decorated with one of the supported methods from the example below.
each method decorator accepts an optional path parameter to be added to the path of the controller, the result of concatenating
both controller and method paths is the final url of that request.
methods can be async or not optionally up for the developers needs.
handling the request logic is the exact same provided by [express js](https://expressjs.com/).

``` typescript
@GRController('/api/post')
export class CrudController extends Controller {

  @GET()
  public async getRequest(req: Request, res: Response) {
  }

  @POST()
  public async postReq(req: Request, res: Response) {
  }
  
  @PUT()
  public async putReq(req: Request, res: Response) {
  }
  
  @DELETE()
  public async deleteReq(req: Request, res: Response) {
  }
  
  @PATCH()
  public async patchReq(req: Request, res: Response) {
  }
  
  @ALL('/check')
  public allReq(req: Request, res: Response) {
  }
  
  @HEAD('/ping')
  public headReq(req: Request, res: Response) {
  }

}
```
### Interceptors
An Interceptor is any class that implements the `Interceptor` interface, and is decorated with
`@GrInterceptor`. an interceptor must implement the `handle` method in order to be executed.
this method will be fired once any request that matches the path parameter passed to the decorator.
the request handling is also provided by [express js](https://expressjs.com/).
this will only handle the definition itself.

``` typescript
@GRInterceptor('/api')
export class MainInterceptor implements Interceptor {
  public handle(req: Request, res: Response, next: NextFunction): void {
    log('interceptor for \'/api\' fired');
    next();
  }
}
```
### Services
A service is any class that is decorated with `@GrService`, a service can contain any logic related to your application
a service will be automatically created once defined in a module, and then a uniq instance will be injected
to any other class ([service](#services), [controller](#controllers) or [interceptor](#interceptors)) that needs it,
you can find more about [dependency injections here](#dependency-injection).

the best practice would be putting all logic in the services, and then use that service to handle actual requests in the controllers,
 so the controllers would have the least amount of logic inside.
 
### Entities

An entity is simply a collection definition. for now, we still only support mongoDb.

An entity is any class decorated with the `@GrEntity` this decorator accepts as parameters the name of the collection, if not provided it falls back to the class name,
and it accepts as well the rest of the parameters that you can pass to the [`Schema` constructor provided by mongoose](https://mongoosejs.com/docs/guide.html).

An entity attribute is a class property with the `@Attribute` decorator,
it accepts the same [schema type definitions](https://mongoosejs.com/docs/guide.html) provided by mongoose. 

Any entity class field with initial value and no `@Attribute` decorator, or a getter, will be considered as a [mongoose virtual type](https://mongoosejs.com/docs/api/virtualtype.html)

An entity method can be decorated with `@PreHook` to be considered as a [pre lifecycle hook](https://mongoosejs.com/docs/api.html#schema_Schema-pre) 

An entity method can be decorated with `@PostHook`decorator with giving the lifecycle that you want.
The method can be async, the return value will be passed as a next function so if any object is return it will be treated as an error. if all good, you shoud not return anything.
In the case of a find query, the method will accept the query object as a parameter.
In the case of an `insertMany`Hook, the this object will be null, and the first parameter will be the array of the inserted documents.

Any entity class method will be considered as a [mongoose schema method](https://mongoosejs.com/docs/guide.html#methods)

An entity class must be defined in a module in order for it to be considered and later injected. Once defined a model will be automatically created.

``` typescript
@GREntity({
  versionKey: false,
})
export class UserEntity {

  @Attribute({
    type: String,
    required: true
  })
  public firstName: string;

  @Attribute({
    type: String
  })
  public lastName: string;

  @PreHook('validate')
  public preValidate(): void {
  }
  
  @PreHook('save')
  public async preSave(): Promise<void> {
    await someAsyncOperation();
  }

  @PostHook('save')
  public postSaveUser(): void {
    console.log('use created:', this.firstName);
  }

  public get fullName(): string {
    return `${this.firstName}, ${this.lastName}`;
  }

}
```
To inject an entity's [model](https://mongoosejs.com/docs/models.html), you define it as a readonly property of a class
and decorate it with `GrRepository` to be injected once the app is running.

These models can be used for all required operations.

They are not accessible in the constructor of the class, you can make use of [OnStartup](#onstartup)
### Dependency Injection
We provide the classical dependency injection mechanism, a service can be injected into other components simply by
defining it as a constructor parameter. A singleton instance then will be passed down to that constructor.

An entity repository can be only injected via the `GrRepository` decorator and is not available in the constructor.

``` typescript

@GRController('/api/users')
export class Other extends Controller {

  @GrRepository(UserEntity.name)
  public userRep: Repository<UserEntity>;

  public constructor(private readonly userService: UserService,
                     private readonly errorHandler: ErrorHandlerService) {
    super();
    log('userService created, userRep is still null');
  }

  @GET()
  public async getAll(req: Request, res: Response) {
    if (await this.userService.isSuperAdmin()) {
        res.send(await this.userRep.find().exec());
    } else {
        this.errorHandler.rejectUnAuthorized();
    }
  }
}

```
### OnStartup
 ``@OnStartup`` is a decorator that can be used on class methods, (module, service, controller, interceptor...), in order
 to execute it once the Singleton instance of that class in created, all dependencies
 got injected, and the application is running.
 this can be used to make initial app configuration or created mock-data if need be.

``` typescript
@GRServer({
  modules: [ MainModule, EntitiesModule ],
  mongoUrl: MONGO_URL,
  handleAppCreated: (app) => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
  }
})
export class Server extends GrApplicationServer {
  @GrRepository(UserEntity.name)
  private userRep: Repository<UserEntity>;

  @OnStartup
  public async onStartUp() {
    console.log('app started');
    await this.userRep.deleteMany({}).exec();
  }
}
 
```
