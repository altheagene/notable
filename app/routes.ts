import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/landing.tsx"),
    route('loginregister', 'routes/loginregister.tsx'),
    route('main', 'routes/mainapp.tsx', [
        route('mystack', 'routes/myStack.tsx'),
        route('mystack/:stackid', 'routes/createStack.tsx'),
        route('quiz/:stackid', 'routes/quiz.tsx'),
        route('quiz/results', 'routes/results.tsx')
    ]),
] satisfies RouteConfig;
