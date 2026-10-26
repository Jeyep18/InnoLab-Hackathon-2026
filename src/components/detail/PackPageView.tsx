import { Container } from '@/components/site/layout'
import { FilesPanel } from '../FilesPanel'
import { TrustPanel } from '../TrustPanel'
import { PackActions, MobileDownloadBar } from './PackActions'
import { PackHeader, StatusNotice } from './PackHeader'
import { PackNotes, Adaptations } from './PackNotes'
import { Preview } from './Preview'
import { ReportDialog } from './ReportDialog'
import type { PackPageModel } from './usePackPage'

export function PackPageView({ model }: { model: PackPageModel }) {
  const { resource, downloads, endRef } = model
  return (
    <>
      <Container className="pt-4 pb-32 lg:pb-0">
        {resource.status !== 'published' && <StatusNotice resource={resource} />}
        <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-10">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <PackHeader resource={resource} />
          </div>
          {/* Phones retain the title, trust, preview order. */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
              <TrustPanel resource={resource} actions={<PackActions model={model} />} />
            </div>
          </div>
          <div className="min-w-0 space-y-5 lg:col-start-1 lg:row-start-2">
            <Preview resource={resource} downloads={downloads} />
            <FilesPanel resource={resource} downloads={downloads} />
            <PackNotes resource={resource} />
            <Adaptations model={model} />
          </div>
        </div>
        <div ref={endRef} aria-hidden="true" className="h-px" />
      </Container>
      {downloads.canDownload && <MobileDownloadBar model={model} />}
      <ReportDialog resource={resource} open={model.reporting} onClose={() => model.setReporting(false)} />
    </>
  )
}
