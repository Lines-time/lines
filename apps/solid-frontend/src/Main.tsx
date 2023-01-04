import { Navigate, Route, Routes } from "@solidjs/router";
import { Component, lazy } from "solid-js";

const App = lazy(() => import("./layouts/App"));
const Track = lazy(() => import("@/Track"));
const Day = lazy(() => import("@/track/Day"));
const Week = lazy(() => import("@/track/Week"));
const Month = lazy(() => import("@/track/Month"));
const Dashboard = lazy(() => import("@/Dashboard"));
const Calendar = lazy(() => import("@/Calendar"));
const ReportsOverview = lazy(() => import("@/reports/Overview"));
const Personal = lazy(() => import("@/Personal"));

const Main: Component = () => {
    return (
        <>
            <Routes>
                <Route path="/" component={App}>
                    <Route path="/" component={Dashboard} />
                    <Route path="/track" component={Track}>
                        <Route path="/" element={<Navigate href="day" />} />
                        <Route path="/day" component={Day} />
                        <Route path="/week" component={Week} />
                        <Route path="/month" component={Month} />
                    </Route>
                    <Route path="/calendar" component={Calendar} />
                    <Route path="/reports">
                        <Route path="/" component={ReportsOverview} />
                    </Route>
                    <Route path="/personal" component={Personal} />
                </Route>
            </Routes>
        </>
    );
};

export default Main;
