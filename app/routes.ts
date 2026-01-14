import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/landing.tsx"),
    route('loginregister', 'routes/loginregister.tsx'),
    route('main', 'routes/mainapp.tsx', [
        route('createstack', 'routes/createStack.tsx'),
        route('mystack', 'routes/myStack.tsx'),
        route('quiz', 'routes/quiz.tsx')
    ])
] satisfies RouteConfig;
