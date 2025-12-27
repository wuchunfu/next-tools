<script setup lang="ts">
import type { SignatureInfo } from '../pdf-signature-checker.types'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToolI18n } from '@/composable/useToolI18n';
import { cn } from '@/lib/utils';
import { tableCellClasses, tableContainerClasses, tableHeadClasses, tableHeaderClasses } from '@/utils/table'

const props = defineProps<{ signature: SignatureInfo }>()
const { signature } = toRefs(props)

const { t } = useToolI18n()

const tableHeaders = computed(() => ({
  certificateName: t('tools.pdf-signature-checker.certificateName', { index: 0 }).replace(/\d+/, ''),
  validityPeriod: t('tools.pdf-signature-checker.validityPeriod'),
  issuedBy: t('tools.pdf-signature-checker.issuedBy'),
  issuedTo: t('tools.pdf-signature-checker.issuedTo'),
  pemCertificate: t('tools.pdf-signature-checker.pemCertificate'),
}))

const certs = computed(() => signature.value.meta.certs.map((certificate, index) => ({
  ...certificate,
  validityPeriod: {
    notBefore: new Date(certificate.validityPeriod.notBefore).toLocaleString(),
    notAfter: new Date(certificate.validityPeriod.notAfter).toLocaleString(),
  },
  certificateName: t('tools.pdf-signature-checker.certificateName', { index: index + 1 }),
})),
)
</script>

<template>
  <div class="space-y-4">
    <Table :container-class="tableContainerClasses">
      <TableHeader :class="tableHeaderClasses">
        <TableRow>
          <TableHead :class="tableHeadClasses">
            {{ tableHeaders.certificateName }}
          </TableHead>
          <TableHead :class="tableHeadClasses">
            {{ tableHeaders.validityPeriod }}
          </TableHead>
          <TableHead :class="tableHeadClasses">
            {{ tableHeaders.issuedBy }}
          </TableHead>
          <TableHead :class="tableHeadClasses">
            {{ tableHeaders.issuedTo }}
          </TableHead>
          <TableHead :class="tableHeadClasses">
            {{ tableHeaders.pemCertificate }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="cert in certs" :key="cert.certificateName">
          <TableCell :class="cn(tableCellClasses, 'font-medium')">
            {{ cert.certificateName }}
          </TableCell>

          <TableCell>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="text-xs">
                  Not Before
                </Badge>
                <span class="text-sm">{{ cert.validityPeriod.notBefore }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="outline" class="text-xs">
                  Not After
                </Badge>
                <span class="text-sm">{{ cert.validityPeriod.notAfter }}</span>
              </div>
            </div>
          </TableCell>

          <TableCell>
            <Card class="w-64">
              <CardContent class="p-3 space-y-2">
                <div v-if="cert.issuedBy.commonName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.commonName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedBy.commonName }}</span>
                </div>
                <div v-if="cert.issuedBy.organizationName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.organizationName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedBy.organizationName }}</span>
                </div>
                <div v-if="cert.issuedBy.countryName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.countryName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedBy.countryName }}</span>
                </div>
                <div v-if="cert.issuedBy.localityName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.localityName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedBy.localityName }}</span>
                </div>
                <div v-if="cert.issuedBy.organizationalUnitName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.organizationalUnitName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedBy.organizationalUnitName }}</span>
                </div>
                <div v-if="cert.issuedBy.stateOrProvinceName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.stateOrProvinceName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedBy.stateOrProvinceName }}</span>
                </div>
              </CardContent>
            </Card>
          </TableCell>

          <TableCell>
            <Card class="w-64">
              <CardContent class="p-3 space-y-2">
                <div v-if="cert.issuedTo.commonName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.commonName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedTo.commonName }}</span>
                </div>
                <div v-if="cert.issuedTo.organizationName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.organizationName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedTo.organizationName }}</span>
                </div>
                <div v-if="cert.issuedTo.countryName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.countryName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedTo.countryName }}</span>
                </div>
                <div v-if="cert.issuedTo.localityName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.localityName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedTo.localityName }}</span>
                </div>
                <div v-if="cert.issuedTo.organizationalUnitName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.organizationalUnitName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedTo.organizationalUnitName }}</span>
                </div>
                <div v-if="cert.issuedTo.stateOrProvinceName" class="flex justify-between">
                  <span class="text-xs text-muted-foreground">{{ t('tools.pdf-signature-checker.stateOrProvinceName') }}:</span>
                  <span class="text-xs font-mono">{{ cert.issuedTo.stateOrProvinceName }}</span>
                </div>
              </CardContent>
            </Card>
          </TableCell>

          <TableCell>
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="outline" size="sm">
                  {{ t('tools.pdf-signature-checker.viewPemCert') }}
                </Button>
              </DialogTrigger>
              <DialogContent class="max-w-2xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{{ t('tools.pdf-signature-checker.pemCertificate') }}</DialogTitle>
                  <DialogDescription>
                    {{ cert.certificateName }}
                  </DialogDescription>
                </DialogHeader>
                <div class="mt-4">
                  <pre class="text-xs font-mono bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap break-all">{{ cert.pemCertificate }}</pre>
                </div>
              </DialogContent>
            </Dialog>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
