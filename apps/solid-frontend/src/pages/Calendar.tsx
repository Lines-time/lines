import { useSearchParams } from "@solidjs/router";
import dayjs from "dayjs";
import { Plus } from "lucide-solid";
import {
    Component,
    createEffect,
    createMemo,
    createResource,
    createSignal,
    onMount,
} from "solid-js";
import Button from "~/Button";
import Dropdown from "~/Dropdown";
import VacationModal from "~/modals/VacationModal";
import Navbar from "~/Navbar";
import CalendarMonth from "~/specialized/Calendar/CalendarMonth";

import dailyWorkTimeTargetStore from "../store/dailyWorkTimeTargetStore";
import freeDayStore from "../store/freeDayStore";
import sickDayStore from "../store/sickDayStore";
import vacationStore from "../store/vacationStore";
import { parseTimeStringDuration } from "../utils/utils";

const Calendar: Component = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [now, setNow] = createSignal(searchParams.d ? dayjs(searchParams.d) : dayjs());
    const [vacationModalOpen, setVacationModalOpen] = createSignal(false);
    const start = createMemo(() => now().date(1));
    const end = createMemo(() => now().date(now().daysInMonth()));

    onMount(() => {
        if (searchParams.d === undefined) {
            setSearchParams({
                d: now().format("YYYY-MM-DD"),
            });
        } else {
            setNow(dayjs(searchParams.d));
        }
    });

    createEffect(() => {
        setSearchParams({
            d: now().format("YYYY-MM-DD"),
        });
    });

    const [targetTime] = createResource(
        () => start(),
        async () => await dailyWorkTimeTargetStore.getForDateRange(start().toDate(), end().toDate())
    );
    const [freeDays] = createResource(
        () => now(),
        async () => await freeDayStore.getForDateRange(start().toDate(), end().toDate())
    );
    const [vacations, vacationsResource] = createResource(
        () => now(),
        async () => await vacationStore.getForDateRangeAndUser(start().toDate(), end().toDate())
    );
    const [sickDays, sickDaysResource] = createResource(
        () => now(),
        async () => await sickDayStore.getForDateRangeAndUser(start().toDate(), end().toDate())
    );

    const events = createMemo(() => {
        return (
            targetTime()
                ?.filter((tt) => {
                    return !(
                        vacations()?.some((v) =>
                            dayjs(tt!.date).isBetween(v!.start, v!.end, "day", "[]")
                        ) ||
                        sickDays()?.some((sd) =>
                            dayjs(tt!.date).isBetween(sd!.start_date, sd!.end_date, "day", "[]")
                        )
                    );
                })
                .map((tt) => ({
                    start: tt!.date,
                    end: tt!.date,
                    render: () => (
                        <div>
                            {dayjs
                                .duration(
                                    parseTimeStringDuration(tt?.duration).asMilliseconds() *
                                        (1 -
                                            (freeDays()?.find((fd) =>
                                                dayjs(tt?.date).isSame(fd?.date, "day")
                                            )?.percentage ?? 0))
                                )
                                .format("H:mm[h]")}
                        </div>
                    ),
                })) ?? []
        ).concat(
            freeDays()?.map((fd) => ({
                start: fd!.date,
                end: fd!.date,
                render: () => (
                    <div class="border-2 border-secondary-focus bg-secondary rounded px-1 text-secondary-content">
                        {fd?.description}
                    </div>
                ),
            })) ?? [],
            vacations()?.map((v) => ({
                start: v!.start,
                end: v!.end,
                render: () => (
                    <Dropdown
                        class="w-full"
                        labelClass="w-full cursor-pointer"
                        label={
                            <div
                                class="border-2 rounded px-1"
                                classList={{
                                    "border-primary-focus": v!.approved,
                                    "bg-primary": v!.approved,
                                    "text-primary-content": v!.approved,
                                    // if not approved
                                    "border-error": !v!.approved,
                                    "bg-error": !v!.approved,
                                    "text-error-content": !v!.approved,
                                }}
                            >
                                {v!.description}
                            </div>
                        }
                    >
                        <h3>{v!.description}</h3>
                        {!v!.approved ? (
                            <div class="text-error">This vacation has not yet been approved</div>
                        ) : (
                            <div class="text-success">This vacation has been approved</div>
                        )}
                        <p>Start: {dayjs(v!.start).format("LL")}</p>
                        <p>End: {dayjs(v!.end).format("LL")}</p>
                    </Dropdown>
                ),
            })) ?? [],
            sickDays()?.map((sd) => ({
                start: sd!.start_date,
                end: sd!.end_date,
                render: () => (
                    <div class="border-2 border-[rgba(0,0,0,0.2)] bg-error rounded px-1 text-error-content">
                        {sd?.description}
                    </div>
                ),
            })) ?? []
        );
    });

    return (
        <div class="h-full grid grid-rows-[64px_1fr]">
            <Navbar
                title="Calendar"
                right={
                    <Button icon={Plus} onClick={() => setVacationModalOpen(true)}>
                        Vacation
                    </Button>
                }
            />
            <div>
                <CalendarMonth now={now} onUpdateNow={setNow} events={events} />
            </div>
            <VacationModal
                open={vacationModalOpen()}
                onClose={() => (setVacationModalOpen(false), vacationsResource.refetch())}
            />
        </div>
    );
};
export default Calendar;
