import dayjs from "dayjs";
import { Component, ComponentProps, createMemo, createSignal } from "solid-js";
import Button from "~/Button";
import Datetime from "~/Datetime";
import FormControl from "~/FormControl";
import Modal from "~/Modal";

import vacationStore from "../../store/vacationStore";

type TProps = Pick<ComponentProps<typeof Modal>, "open" | "onClose"> & {};

const VacationModal: Component<TProps> = (props) => {
    const [start, setStart] = createSignal(dayjs().toDate());
    const [end, setEnd] = createSignal(dayjs().toDate());
    const [description, setDescription] = createSignal("");

    const isValidRange = createMemo(() => !dayjs(start()).isAfter(end()));
    const errorMessage = createMemo(() => !isValidRange() && "End date can't be before start date");

    const save = async (event: Event) => {
        event.preventDefault();
        if (isValidRange()) {
            await vacationStore.submitVacationRequest(start(), end(), description());
            props.onClose();
        }
    };

    return (
        <Modal open={props.open} onClose={props.onClose} title="Vacation">
            <form onSubmit={save} class="w-full">
                <FormControl label="Start" error={errorMessage}>
                    <Datetime date value={start()} onChange={setStart} />
                </FormControl>
                <FormControl label="End" error={errorMessage}>
                    <Datetime date value={end()} onChange={setEnd} />
                </FormControl>
                <FormControl label="Description">
                    <textarea
                        class="textarea textarea-bordered h-40 bg-base-200"
                        value={description()}
                        onInput={(e) => setDescription(e.currentTarget.value)}
                    />
                </FormControl>
                <div class="modal-action">
                    <Button submit primary disabled={() => !isValidRange()}>
                        Submit
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
export default VacationModal;
