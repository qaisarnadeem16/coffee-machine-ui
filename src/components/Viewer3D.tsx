import { useZakeke, ZakekeViewer } from '@zakeke/zakeke-configurator-react';
import { Button } from 'components/Atomic';
import ArDeviceSelectionDialog from 'components/dialogs/ArDeviceSelectionDialog';
import RecapPanel from 'components/widgets/RecapPanel';
import {
	findAttribute,
	findGroup,
	findStep,
	launchFullscreen,
	quitFullscreen,
	T,
	useActualGroups,
	useUndoRedoActions
} from 'Helpers';
import { UndoRedoStep } from 'Interfaces';
import { useEffect, useRef, useState } from 'react';
import useStore from 'Store';
import { ReactComponent as BarsSolid } from '../assets/icons/bars-solid.svg';
import { ReactComponent as DesktopSolid } from '../assets/icons/desktop-solid.svg';
import { ReactComponent as ExpandSolid } from '../assets/icons/expand-solid.svg';
import { ReactComponent as CollapseSolid } from '../assets/icons/compress-arrows-alt-solid.svg';
import { ReactComponent as ExplodeSolid } from '../assets/icons/expand-arrows-alt-solid.svg';

import { ReactComponent as RedoSolid } from '../assets/icons/redo-solid.svg';
import { ReactComponent as ResetSolid } from '../assets/icons/reset-alt-solid.svg';
import { ReactComponent as SearchMinusSolid } from '../assets/icons/search-minus-solid.svg';
import { ReactComponent as SearchPlusSolid } from '../assets/icons/search-plus-solid.svg';
import { ReactComponent as UndoSolid } from '../assets/icons/undo-solid.svg';
import { Dialog, useDialogManager } from './dialogs/Dialogs';
import Notifications from './widgets/Notifications';
import {
	AiIcon,
	ArIcon,
	BottomRightIcons,
	CollapseIcon,
	ExplodeIcon,
	FullscreenIcon,
	RecapPanelIcon,
	RedoIcon,
	ResetIcon,
	SecondScreenIcon,
	TopRightIcons,
	UndoIcon,
	ViewerContainer,
	ZoomInIcon,
	ZoomOutIcon
} from './layout/SharedComponents';
import TryOnsButton from 'components/widgets/TryOnsButtons';
import AiDialog from 'components/dialogs/AIDialog';

// Styled component for the container of the 3D view.
const Viewer3D = () => {
	const ref = useRef<HTMLDivElement | null>(null);
	const {
		isSceneLoading,
		IS_IOS,
		IS_ANDROID,
		getMobileArUrl,
		openArMobile,
		isSceneArEnabled,
		zoomIn,
		zoomOut,
		sellerSettings,
		reset,
		openSecondScreen,
		product,
		hasExplodedMode,
		setExplodedMode,
		hasVTryOnEnabled,
		getTryOnSettings,
		isInfoPointContentVisible,
		isAIEnabled
	} = useZakeke();

	const [isRecapPanelOpened, setRecapPanelOpened] = useState(
		sellerSettings?.isCompositionRecapVisibleFromStart ?? false
	);

	const { showDialog, closeDialog } = useDialogManager();
	const { setIsLoading, notifications, removeNotification, isDraftEditor } = useStore();

	useEffect(() => {
		if (sellerSettings && sellerSettings?.isCompositionRecapVisibleFromStart)
			setRecapPanelOpened(sellerSettings.isCompositionRecapVisibleFromStart);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sellerSettings]);

	const switchFullscreen = () => {
		if (
			(document as any).fullscreenElement ||
			(document as any).webkitFullscreenElement ||
			(document as any).mozFullScreenElement ||
			(document as any).msFullscreenElement
		) {
			quitFullscreen(ref.current!);
		} else {
			launchFullscreen(ref.current!);
		}
	};

	const handleArClick = async (arOnFlyUrl: string) => {
		if (IS_ANDROID || IS_IOS) {
			setIsLoading(true);
			const url = await getMobileArUrl();
			setIsLoading(false);
			if (url)
				if (IS_IOS) {
					openArMobile(url as string);
				} else if (IS_ANDROID) {
					showDialog(
						'open-ar',
						<Dialog>
							<Button
								style={{ display: 'block', width: '100%' }}
								onClick={() => {
									closeDialog('open-ar');
									openArMobile(url as string);
								}}
							>
								{T._('See your product in AR', 'Composer')}
							</Button>
						</Dialog>
					);
				}
		} else {
			showDialog('select-ar', <ArDeviceSelectionDialog />);
		}
	};

	const { setIsUndo, undoStack, setIsRedo, redoStack } = useStore();
	const undoRedoActions = useUndoRedoActions();

	const handleUndoClick = () => {
		setIsUndo(true);

		let actualUndoStep = undoStack.length > 0 ? undoStack.pop() : null;
		if (actualUndoStep && actualUndoStep.length > 0) {
			undoRedoActions.fillRedoStack(actualUndoStep);
			actualUndoStep
				.filter((x: UndoRedoStep) => x.direction === 'undo')
				.forEach((singleStep: UndoRedoStep) => handleUndoSingleStep(singleStep));
		}

		setIsUndo(false);
	};

	const { undo, redo } = useZakeke();
	const { setSelectedGroupId, setSelectedStepId, setSelectedAttributeId, isMobile } = useStore();

	const actualGroups = useActualGroups() ?? [];

	const handleUndoSingleStep = (actualUndoStep: UndoRedoStep) => {
		if (actualUndoStep.id === null && !isMobile) return;
		if (actualUndoStep.type === 'group')
			return setSelectedGroupId(findGroup(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'step')
			return setSelectedStepId(findStep(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'attribute')
			return setSelectedAttributeId(findAttribute(actualGroups, actualUndoStep.id)?.id ?? null);
		if (actualUndoStep.type === 'option') {
			return undo();
		}
	};

	const handleRedoClick = () => {
		setIsRedo(true);

		let actualRedoStep = redoStack.length > 0 ? redoStack.pop() : null;
		if (actualRedoStep != null) {
			undoRedoActions.fillUndoStack(actualRedoStep);
			actualRedoStep
				.filter((x: UndoRedoStep) => x.direction === 'redo')
				.forEach(async (singleStep: UndoRedoStep) => handleRedoSingleStep(singleStep));
		}

		setIsRedo(false);
	};

	const handleRedoSingleStep = (actualRedoStep: { type: string; id: number | null; direction: string }) => {
		if (actualRedoStep.id === null && !isMobile) return;
		if (actualRedoStep.type === 'group')
			return setSelectedGroupId(findGroup(actualGroups, actualRedoStep.id)?.id ?? null);
		if (actualRedoStep.type === 'step')
			return setSelectedStepId(findStep(actualGroups, actualRedoStep.id)?.id ?? null);
		else if (actualRedoStep.type === 'attribute')
			return setSelectedAttributeId(findAttribute(actualGroups, actualRedoStep.id)?.id ?? null);
		else if (actualRedoStep.type === 'option') return redo();
	};

	return (
		<ViewerContainer ref={ref}>
			{!isSceneLoading && <ZakekeViewer bgColor='#f2f2f2' className='' />}

			{!isInfoPointContentVisible &&  (
			<div className="bg-white max-w-12 p-5 py-4 items-center justify-center lg:flex hidden flex-col gap-5 lg:gap-7 absolute left-[3%] md:top-1/3 top-[15%] rounded-full">
				<button onClick={handleUndoClick}>
					<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M17.5938 14.9853C17.7095 14.9555 17.8125 14.8837 17.8862 14.7818C17.9599 14.6798 18 14.5536 18 14.4236C17.9969 11.5175 16.9404 8.7314 15.0623 6.67646C13.1842 4.62153 10.6377 3.46558 7.98166 3.46221H7.45667V0.576545C7.45645 0.466954 7.42775 0.359694 7.37392 0.267276C7.32009 0.174858 7.24335 0.101092 7.15265 0.054592C7.06195 0.00809168 6.96104 -0.00922672 6.86168 0.00465437C6.76233 0.0185355 6.66863 0.0630445 6.59152 0.132989L0.190661 5.90262C0.12748 5.95996 0.0774068 6.03264 0.0444279 6.11489C0.0114489 6.19714 -0.00352493 6.28667 0.000698453 6.37637C0.00492184 6.46607 0.0282258 6.55345 0.0687551 6.63155C0.109284 6.70965 0.165919 6.77633 0.234151 6.82626L6.63191 11.442C6.71121 11.5012 6.8038 11.5357 6.89968 11.5416C6.99557 11.5475 7.09111 11.5247 7.176 11.4755C7.26088 11.4264 7.33189 11.3528 7.38135 11.2627C7.43082 11.1726 7.45686 11.0695 7.45667 10.9644V8.07536H7.98399C12.945 8.07536 15.6274 11.6663 17.0036 14.6803C17.0564 14.7962 17.1433 14.8894 17.2504 14.9447C17.3575 15.0001 17.4784 15.0144 17.5938 14.9853Z" fill="#706E6E" />
					</svg>
				</button>
				<button onClick={handleRedoClick}>
					<svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M0.40617 14.9853C0.290537 14.9555 0.18751 14.8837 0.113789 14.7818C0.0400677 14.6798 -2.86102e-05 14.5536 0 14.4236C0.00308228 11.5175 1.05957 8.7314 2.93771 6.67646C4.81584 4.62153 7.36226 3.46558 10.0183 3.46221H10.5433V0.576545C10.5435 0.466954 10.5722 0.359694 10.6261 0.267276C10.6799 0.174858 10.7567 0.101092 10.8473 0.054592C10.938 0.00809168 11.039 -0.00922672 11.1383 0.00465437C11.2377 0.0185355 11.3314 0.0630445 11.4085 0.132989L17.8093 5.90262C17.8725 5.95996 17.9226 6.03264 17.9556 6.11489C17.9886 6.19714 18.0035 6.28667 17.9993 6.37637C17.9951 6.46607 17.9718 6.55345 17.9312 6.63155C17.8907 6.70965 17.8341 6.77633 17.7658 6.82626L11.3681 11.442C11.2888 11.5012 11.1962 11.5357 11.1003 11.5416C11.0044 11.5475 10.9089 11.5247 10.824 11.4755C10.7391 11.4264 10.6681 11.3528 10.6186 11.2627C10.5692 11.1726 10.5431 11.0695 10.5433 10.9644V8.07536H10.016C5.05499 8.07536 2.37256 11.6663 0.996397 14.6803C0.943605 14.7962 0.856678 14.8894 0.749609 14.9447C0.642542 15.0001 0.521568 15.0144 0.40617 14.9853Z" fill="#706E6E" />
					</svg>

				</button>
				<button>
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g clip-path="url(#clip0_38_38)">
							<path d="M8.99997 12.0002C9.8284 12.0002 10.5 11.3286 10.5 10.5002C10.5 9.67176 9.8284 9.00018 8.99997 9.00018C8.17153 9.00018 7.49995 9.67176 7.49995 10.5002C7.49995 11.3286 8.17153 12.0002 8.99997 12.0002Z" fill="#706E6E" />
							<path d="M16.902 3.0918L14.9085 1.09831C14.709 0.901958 14.4881 0.728637 14.25 0.581544V2.25031C14.2475 4.32034 12.57 5.99782 10.5 6.00032H7.49999C5.42995 5.99782 3.75247 4.32034 3.75001 2.25031V0.000305176C1.67998 0.00280127 0.00249609 1.68028 0 3.75032V14.2503C0.00249609 16.3204 1.67998 17.9978 3.75001 18.0003H14.25C16.32 17.9978 17.9975 16.3204 18 14.2503V5.74308C18.0028 4.74812 17.6074 3.79342 16.902 3.0918ZM9 13.5003C7.34316 13.5003 6.00001 12.1572 6.00001 10.5003C6.00001 8.84347 7.34316 7.50033 9 7.50033C10.6568 7.50033 12 8.84347 12 10.5003C12 12.1572 10.6568 13.5003 9 13.5003Z" fill="#706E6E" />
							<path d="M7.49995 4.50012H10.4999C11.7426 4.50012 12.7499 3.49275 12.7499 2.25012V0.0481409C12.5869 0.0215627 12.4223 0.00553149 12.2572 0.000152588H5.24995V2.25015C5.24995 3.49275 6.25732 4.50012 7.49995 4.50012Z" fill="#706E6E" />
						</g>
						<defs>
							<clipPath id="clip0_38_38">
								<rect width="18" height="18" fill="white" />
							</clipPath>
						</defs>
					</svg>

				</button>
				<button onClick={reset}>
					<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g clip-path="url(#clip0_38_45)">
							<path d="M6.87903 19.7083C3.86773 18.2783 1.71285 15.3633 1.38133 11.9167H0C0.460444 17.5633 5.21222 22 11.0046 22L11.6124 21.9725L8.10381 18.48L6.87903 19.7083ZM7.69862 13.7133C7.52365 13.7133 7.3671 13.6858 7.21976 13.64C7.08258 13.5937 6.95697 13.5187 6.8514 13.42C6.7501 13.3283 6.66722 13.2183 6.61197 13.0808C6.55672 12.9525 6.52909 12.8058 6.52909 12.65H5.33194C5.33194 12.98 5.3964 13.2917 5.52532 13.5208C5.65425 13.75 5.82922 13.9792 6.04102 14.1533C6.26203 14.3183 6.51067 14.4467 6.79615 14.5292C7.07242 14.6208 7.3671 14.6667 7.6802 14.6667C8.02093 14.6667 8.34324 14.6208 8.62871 14.5292C8.9234 14.4375 9.18125 14.3 9.39305 14.1258C9.60486 13.9517 9.77982 13.75 9.89954 13.4658C10.0193 13.2 10.0837 12.9067 10.0837 12.5767C10.0837 12.4025 10.0653 12.2283 10.0193 12.0633C9.97321 11.9167 9.90875 11.7425 9.80745 11.5958C9.71536 11.4583 9.58644 11.3208 9.4391 11.2017C9.28255 11.0825 9.09837 11 8.87735 10.9175C9.21098 10.7711 9.49542 10.5325 9.69694 10.23C9.78903 10.0833 9.8535 9.955 9.89954 9.80833C9.94558 9.66167 9.964 9.515 9.964 9.36833C9.964 9.03833 9.90875 8.745 9.79824 8.48833C9.66932 8.25 9.53119 8.02083 9.32859 7.85583C9.14441 7.68167 8.89577 7.55333 8.61951 7.46167C8.33403 7.37917 8.02093 7.33333 7.6802 7.33333C7.3671 7.33333 7.04479 7.37917 6.75931 7.48C6.48305 7.58083 6.23441 7.71833 6.03181 7.8925C5.83843 8.06667 5.68188 8.25 5.56216 8.50667C5.45165 8.745 5.3964 9.00167 5.3964 9.28583H6.59355C6.59355 9.13 6.62118 8.9925 6.67643 8.87333C6.72845 8.75342 6.80718 8.64684 6.90666 8.56167C7.00795 8.47917 7.11846 8.40583 7.25659 8.36C7.39473 8.31417 7.53286 8.28667 7.69862 8.28667C8.06697 8.28667 8.34324 8.37833 8.51821 8.57083C8.69318 8.75417 8.78527 9.02 8.78527 9.35917C8.78527 9.52417 8.74843 9.67083 8.71159 9.80833C8.6658 9.9394 8.58645 10.0563 8.48137 10.1475C8.38008 10.2392 8.25115 10.3125 8.10381 10.3675C7.95647 10.4225 7.77229 10.45 7.56969 10.45H6.86061V11.3942H7.56969C7.77229 11.3942 7.95647 11.4125 8.12223 11.4583C8.28799 11.5042 8.42612 11.5775 8.53663 11.6692C8.64713 11.77 8.74843 11.8892 8.80368 12.0358C8.86815 12.1825 8.89577 12.375 8.89577 12.5583C8.89577 12.9342 8.78527 13.2183 8.57346 13.4108C8.36166 13.6217 8.06697 13.7133 7.69862 13.7133ZM15.5722 8.28667C15.2775 7.98417 14.9276 7.74583 14.5224 7.58083C14.1264 7.41583 13.6752 7.33333 13.1779 7.33333H11.0046V14.6667H13.1226C13.6291 14.6667 14.0988 14.5842 14.5132 14.4192C14.9276 14.2542 15.2867 14.025 15.5814 13.7225C15.8761 13.42 16.1155 13.0533 16.2629 12.6317C16.4194 12.2008 16.5023 11.7242 16.5023 11.1925V10.8258C16.5023 10.2942 16.4194 9.8175 16.2629 9.38667C16.1155 8.95583 15.8669 8.58917 15.5722 8.28667ZM15.1946 11.1833C15.1946 11.5683 15.167 11.9167 15.0841 12.2192C14.992 12.5217 14.8631 12.7875 14.6882 12.9983C14.5132 13.2092 14.2738 13.3742 14.0343 13.4842C13.7673 13.5942 13.4634 13.6492 13.1226 13.6492H12.2846V8.36H13.1779C13.8409 8.36 14.3474 8.57083 14.6882 8.9925C15.0381 9.41417 15.1946 10.0192 15.1946 10.8167M11.0046 0L10.3968 0.0275L13.9054 3.52L15.1302 2.29167C18.1415 3.72167 20.2964 6.6275 20.6187 10.0833H22C21.5396 4.43667 16.797 0 11.0046 0Z" fill="#706E6E" />
						</g>
						<defs>
							<clipPath id="clip0_38_45">
								<rect width="22" height="22" fill="white" />
							</clipPath>
						</defs>
					</svg>

				</button>
				<button onClick={openSecondScreen}>
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M14.5029 11.0006C13.9354 11.0007 13.3765 11.1389 12.8744 11.4033C12.3722 11.6676 11.9419 12.0501 11.6206 12.5178L6.7456 10.3166C7.08748 9.47704 7.09017 8.53758 6.7531 7.69609L11.6236 5.48434C12.0985 6.1734 12.8047 6.66939 13.6141 6.88234C14.4234 7.09529 15.2823 7.01109 16.0348 6.64501C16.7874 6.27894 17.3838 5.65523 17.7159 4.88706C18.0479 4.11888 18.0937 3.25712 17.8448 2.45812C17.5958 1.65911 17.0688 0.975796 16.3592 0.532133C15.6496 0.0884697 14.8045 -0.0861482 13.9771 0.0399583C13.1498 0.166065 12.3951 0.584541 11.8499 1.21947C11.3047 1.8544 11.0052 2.66371 11.0056 3.50059C11.0056 3.69965 11.0224 3.89836 11.0559 4.09459L5.8876 6.44059C5.38937 5.97591 4.76636 5.66674 4.09497 5.55098C3.42358 5.43523 2.73301 5.51792 2.10793 5.78892C1.48286 6.05993 0.950457 6.50746 0.576024 7.07663C0.201591 7.64581 0.001402 8.31188 7.33709e-06 8.99317C-0.00138732 9.67447 0.196073 10.3414 0.568173 10.9121C0.940272 11.4828 1.47083 11.9325 2.09479 12.206C2.71875 12.4796 3.40898 12.5651 4.08084 12.4521C4.7527 12.3391 5.37697 12.0325 5.8771 11.5698L11.0521 13.9076C10.9305 14.6149 11.0292 15.3425 11.3349 15.9918C11.6406 16.6411 12.1385 17.1807 12.7611 17.5376C13.3838 17.8945 14.1011 18.0514 14.8158 17.987C15.5306 17.9226 16.2083 17.64 16.7571 17.1776C17.306 16.7151 17.6994 16.0951 17.8841 15.4017C18.0688 14.7082 18.0358 13.9746 17.7897 13.3005C17.5436 12.6263 17.0962 12.0441 16.5081 11.6327C15.9201 11.2214 15.2205 11.0007 14.5029 11.0006Z" fill="#706E6E" />
					</svg>


				</button>
				<button onClick={zoomIn}>
					<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="23" width="23" height="23" rx="11.5" transform="rotate(90 23 0)" fill="#E2DFDF" />
						<path d="M17 11.5H6.00003" stroke="#3D3D3D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						<path d="M11.4992 17V6" stroke="#3D3D3D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>

				</button>
				<button onClick={zoomOut}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="24" y="24" width="24" height="24" rx="12" transform="rotate(180 24 24)" fill="#E2DFDF" />
						<path d="M6.5 12H17.5" stroke="#3D3D3D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>

				</button>
			</div>)}
			{/* {!isInfoPointContentVisible && (
				<>
					<ZoomInIcon $isMobile={isMobile} key={'zoomin'} hoverable onClick={zoomIn}>
						<SearchPlusSolid />
					</ZoomInIcon>
					<ZoomOutIcon $isMobile={isMobile} key={'zoomout'} hoverable onClick={zoomOut}>
						<SearchMinusSolid />
					</ZoomOutIcon>
					{sellerSettings?.canUndoRedo && (
						<ResetIcon $isMobile={isMobile} key={'reset'} hoverable onClick={reset}>
							<ResetSolid />
						</ResetIcon>
					)}
					{sellerSettings?.canUndoRedo && (
						<UndoIcon $isMobile={isMobile} key={'undo'} hoverable onClick={handleUndoClick}>
							<UndoSolid />
						</UndoIcon>
					)}
					{sellerSettings?.canUndoRedo && (
						<RedoIcon $isMobile={isMobile} key={'redo'} hoverable onClick={handleRedoClick}>
							<RedoSolid />
						</RedoIcon>
					)}
					{!isSceneLoading && hasVTryOnEnabled && !isDraftEditor && <TryOnsButton settings={getTryOnSettings()} />}
					<BottomRightIcons>
						{hasExplodedMode() && product && !isSceneLoading && (
							<>
								<CollapseIcon hoverable onClick={() => setExplodedMode(false)}>
									<CollapseSolid />
								</CollapseIcon>
								<ExplodeIcon hoverable onClick={() => setExplodedMode(true)}>
									<ExplodeSolid />
								</ExplodeIcon>
							</>
						)}

						{product && product.isShowSecondScreenEnabled && !isDraftEditor && (
							<SecondScreenIcon key={'secondScreen'} hoverable onClick={openSecondScreen}>
								<DesktopSolid />
							</SecondScreenIcon>
						)}

						{!IS_IOS && (
							<FullscreenIcon
								className='fullscreen-icon'
								key={'fullscreen'}
								hoverable
								onClick={switchFullscreen}
							>
								<ExpandSolid />
							</FullscreenIcon>
						)}
					</BottomRightIcons>
					<TopRightIcons>
						{product && product.isAiConfigurationEnabled && isAIEnabled && !isDraftEditor && (
							<AiIcon
								$isArIconVisible={isSceneArEnabled()}
								onClick={() => showDialog('ai', <AiDialog />)}
							>
							</AiIcon>
						)}

						{isSceneArEnabled() && !isDraftEditor && <ArIcon onClick={() => handleArClick('ar.html')} />}
					</TopRightIcons>
					{sellerSettings?.isCompositionRecapEnabled && (
						<RecapPanelIcon key={'recap'} onClick={() => setRecapPanelOpened(!isRecapPanelOpened)}>
							<BarsSolid />
						</RecapPanelIcon>
					)}
					{sellerSettings?.isCompositionRecapEnabled && isRecapPanelOpened && (
						<RecapPanel key={'recapPanel'} onClose={() => setRecapPanelOpened(false)} />
					)}{' '}
				</>
			)} */}

			{/* Notifications */}
			<Notifications
				notifications={notifications}
				onRemoveNotificationClick={(notification) => removeNotification(notification.id)}
			/>
		</ViewerContainer>
	);
};

export default Viewer3D;
