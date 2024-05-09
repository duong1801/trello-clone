/** @format */

import Box from "@mui/material/Box"
import ListColumns from "./ListColumns/ListColumns"
import { mapOrder } from "~/utils/sorts"

import {
	DndContext,
	// PointerSensor,
	useSensor,
	MouseSensor,
	TouchSensor,
	useSensors,
	DragOverlay,
	defaultDropAnimationSideEffects,
	closestCorners,
} from "@dnd-kit/core"
import { useEffect, useState } from "react"
import { cloneDeep } from "lodash"
import { arrayMove } from "@dnd-kit/sortable"
import Column from "./ListColumns/Column/Column"
import Card from "./ListColumns/Column/ListCards/Card/Card"
const ACTIVE_DRAG_ITEM_TYPE = {
	COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
	CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
}

function BoardContent({ board }) {
	// const pointerSensor = useSensor(PointerSensor, {
	// 	activationConstraint: {
	// 		distance: 10,
	// 	},
	// })
	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10,
		},
	})
	const touchSensor = useSensor(TouchSensor, {
		activationConstraint: {
			delay: 250,
			tolerance: 5,
		},
	})
	const sensors = useSensors(mouseSensor, touchSensor)

	const [orderedColumns, setOrderedColumns] = useState([])

	const [activeDragItemId, setActiveDragItemId] = useState(null)
	const [activeDragItemType, setActiveDragItemType] = useState(null)
	const [activeDragItemData, setActiveDragItemData] = useState(null)
	const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
		useState(null)
	useEffect(() => {
		setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"))
	}, [board])
 
	// Tìm columns theo card_id
	const findColumnByCardId = (cardId) => {
		return orderedColumns.find((column) =>
			column?.cards?.map((card) => card._id)?.includes(cardId)
		)
	}

	const handleDragStart = (event) => {
		// console.log(event)
		setActiveDragItemId(event?.active?.id)
		setActiveDragItemType(
			event?.active?.data?.current?.columnId
				? ACTIVE_DRAG_ITEM_TYPE.CARD
				: ACTIVE_DRAG_ITEM_TYPE.COLUMN
		)

		setActiveDragItemData(event?.active?.data?.current)

		if (event?.active?.data?.current?.columnId) {
			setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
		}
	}

	const handleDragOver = (event) => {
		if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
			return
		}
		if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
			const { active, over } = event
			if (!over || !active) return
			const {
				id: activeDraggingCardId,
				data: { current: activeDraggingCardData },
			} = active
			const { id: overCardId } = over
			const activeColumn = findColumnByCardId(activeDraggingCardId)
			const overColumn = findColumnByCardId(overCardId)
			if (!activeColumn || !overColumn) return
			if (activeColumn._id !== overColumn._id) {
				setOrderedColumns((prevColumns) => {
					const overCardIndex = overColumn?.cards?.findIndex(
						(card) => card._id === overCardId
					)
					let newCardIndex

					const isBelowOverItem =
						active.rect.current.translated &&
						active.rect.current.translated.top >
							over.rect.top + over.rect.height

					const modifier = isBelowOverItem ? 1 : 0

					newCardIndex =
						overCardIndex >= 0
							? overCardIndex + modifier
							: overColumn?.card?.length + 1

					const nextColumns = cloneDeep(prevColumns)
					const nextActiveColumns = nextColumns.find(
						(column) => column._id === activeColumn._id
					)
					const nextOverColumns = nextColumns.find(
						(column) => column._id === overColumn._id
					)

					if (nextActiveColumns) {
						//
						nextActiveColumns.cards = nextActiveColumns.cards.filter(
							(card) => card._id !== activeDraggingCardId
						)

						nextActiveColumns.cardOrderIds = nextActiveColumns.cards.map(
							(card) => card._id
						)
					}
					if (nextOverColumns) {
						nextOverColumns.cards = nextOverColumns.cards.filter(
							(card) => card._id !== activeDraggingCardId
						)
						nextOverColumns.cards = nextOverColumns.cards.toSpliced(
							newCardIndex,
							0,
							activeDraggingCardData
						)
						nextOverColumns.cardOrderIds = nextOverColumns.cards.map(
							(card) => card._id
						)
					}
					return nextColumns
				})
			}
		}
	}

	const handleDragEnd = (event) => {
		const { active, over } = event

		if (!over || !active) return

		if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
			const {
				id: activeDraggingCardId,
				data: { current: activeDraggingCardData },
			} = active
			const { id: overCardId } = over
			const activeColumn = findColumnByCardId(activeDraggingCardId)
			const overColumn = findColumnByCardId(overCardId)
			if (!activeColumn || !overColumn) return
			if (oldColumnWhenDraggingCard._id !== overColumn._id) {
				console.log("kéo sang column khác")
			} else {
				//Hành động kéo thả card trong cùng 1 column
				const oldCardIndex = oldColumnWhenDraggingCard?.cards.findIndex(
					(c) => c._id === activeDragItemId
				)
				const newCardIndex = overColumn?.cards.findIndex(
					(c) => c._id === overCardId 
				)
				const dndOrderedCards = arrayMove(
					oldColumnWhenDraggingCard?.cards,
					oldCardIndex,
					newCardIndex
				)
				setOrderedColumns((prevColumns) => {
					const nextColumns = cloneDeep(prevColumns)
					const targetColumn = nextColumns.find((c) => c._id === overColumn._id)
					targetColumn.cards = dndOrderedCards
					targetColumn.cardOrderIds = dndOrderedCards.map((c) => c._id)
					return nextColumns
				})
			}
		}

		if (
			activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN &&
			active.id !== over.id
		) {
			const oldColumnIndex = orderedColumns.findIndex(
				(c) => c._id === active.id
			)
			const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id)
			const dndOrderedColumns = arrayMove(
				orderedColumns,
				oldColumnIndex,
				newColumnIndex
			)
			const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
			setOrderedColumns(dndOrderedColumns)
		}

		setActiveDragItemId(null)
		setActiveDragItemType(null)
		setActiveDragItemData(null)
		setOldColumnWhenDraggingCard(null)
	}

	const customDropAnimation = {
		sideEffects: defaultDropAnimationSideEffects({
			styles: {
				active: {
					opacity: "0.5",
				},
			},
		}),
	}

	return (
		<DndContext
			collisionDetection={closestCorners}
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					height: (theme) => theme.trello.boardContentHeight,
					bgcolor: (theme) => {
						return theme.palette.mode === "dark" ? "#34495e" : "#1976d2"
					},
					p: "10px 0",
				}}>
				<ListColumns columns={orderedColumns} />
				<DragOverlay dropAnimation={customDropAnimation}>
					{!activeDragItemType && null}
					{activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
						<Column column={activeDragItemData} />
					)}

					{activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
						<Card card={activeDragItemData} />
					)}
				</DragOverlay>
			</Box>
		</DndContext>
	)
}

export default BoardContent
