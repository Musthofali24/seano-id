import { useEffect } from 'react'

const useTitle = title => {
  useEffect(() => {
    document.title = `Seano | ${title}`
  }, [title])
}

export default useTitle
