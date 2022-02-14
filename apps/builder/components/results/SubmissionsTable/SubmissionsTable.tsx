/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-key */
import { chakra, Checkbox, Flex } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React, { useEffect, useMemo, useRef } from 'react'
import { Hooks, useRowSelect, useTable } from 'react-table'
import { parseSubmissionsColumns } from 'services/publicTypebot'
import { LoadingRows } from './LoadingRows'

type SubmissionsTableProps = {
  data?: any
  hasMore?: boolean
  onNewSelection: (indices: number[]) => void
  onScrollToBottom: () => void
}

export const SubmissionsTable = ({
  data,
  hasMore,
  onNewSelection,
  onScrollToBottom,
}: SubmissionsTableProps) => {
  const { publishedTypebot } = useTypebot()
  const columns: any = useMemo(
    () => (publishedTypebot ? parseSubmissionsColumns(publishedTypebot) : []),
    [publishedTypebot]
  )

  const bottomElement = useRef<HTMLDivElement | null>(null)
  const tableWrapper = useRef<HTMLDivElement | null>(null)

  const {
    getTableProps,
    headerGroups,
    rows,
    prepareRow,
    getTableBodyProps,
    selectedFlatRows,
  } = useTable({ columns, data }, useRowSelect, checkboxColumnHook) as any

  useEffect(() => {
    onNewSelection(selectedFlatRows.map((row: any) => row.index))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlatRows])

  useEffect(() => {
    if (!bottomElement.current) return
    const options: IntersectionObserverInit = {
      root: tableWrapper.current,
      threshold: 0,
    }
    const observer = new IntersectionObserver(handleObserver, options)
    if (bottomElement.current) observer.observe(bottomElement.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bottomElement.current])

  const handleObserver = (entities: any[]) => {
    const target = entities[0]
    if (target.isIntersecting) onScrollToBottom()
  }

  return (
    <Flex
      maxW="full"
      overflow="scroll"
      ref={tableWrapper}
      className="table-wrapper"
      rounded="md"
    >
      <chakra.table rounded="md" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup: any) => {
            return (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: any) => {
                  return (
                    <chakra.th
                      px="4"
                      py="2"
                      border="1px"
                      borderColor="gray.200"
                      fontWeight="normal"
                      whiteSpace="nowrap"
                      {...column.getHeaderProps()}
                    >
                      {column.render('Header')}
                    </chakra.th>
                  )
                })}
              </tr>
            )
          })}
        </thead>

        <tbody {...getTableBodyProps()}>
          {rows.map((row: any, idx: number) => {
            prepareRow(row)
            return (
              <tr
                {...row.getRowProps()}
                ref={(ref) => {
                  if (idx === data.length - 10) bottomElement.current = ref
                }}
              >
                {row.cells.map((cell: any) => {
                  return (
                    <chakra.td
                      px="4"
                      py="2"
                      border="1px"
                      borderColor="gray.200"
                      whiteSpace={
                        cell?.value?.length > 100 ? 'normal' : 'nowrap'
                      }
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </chakra.td>
                  )
                })}
              </tr>
            )
          })}
          {hasMore === true && <LoadingRows totalColumns={columns.length} />}
        </tbody>
      </chakra.table>
    </Flex>
  )
}

const checkboxColumnHook = (hooks: Hooks<any>) => {
  hooks.visibleColumns.push((columns) => [
    {
      id: 'selection',
      Header: ({ getToggleAllRowsSelectedProps }: any) => (
        <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
      ),
      Cell: ({ row }: any) => (
        <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
      ),
    },
    ...columns,
  ])
}

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, checked, ...rest }: any, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef: any = ref || defaultRef

    return (
      <Flex justify="center" data-testid="checkbox">
        <Checkbox
          ref={resolvedRef}
          {...rest}
          isIndeterminate={indeterminate}
          isChecked={checked}
        />
      </Flex>
    )
  }
)