// PDFExport.jsx — Export du CV adapté en PDF via @react-pdf/renderer
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFDownloadLink,
    Font,
} from '@react-pdf/renderer';

// Styles du PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#1A1A2E',
    },
    header: {
        marginBottom: 18,
        borderBottomWidth: 2,
        borderBottomColor: '#6EE7B7',
        paddingBottom: 14,
    },
    name: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        color: '#0A0A0F',
        marginBottom: 4,
    },
    title: {
        fontSize: 12,
        color: '#16A085',
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: '#6EE7B7',
        backgroundColor: '#0A0A0F',
        padding: '4 8',
        borderRadius: 3,
        marginBottom: 8,
        marginTop: 14,
    },
    bodyText: {
        fontSize: 10,
        color: '#333344',
        lineHeight: 1.6,
    },
    expItem: { marginBottom: 10 },
    expRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    expPoste: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0A0A0F' },
    expEntreprise: { fontSize: 10, color: '#16A085' },
    expPeriode: { fontSize: 9, color: '#888899' },
    expDesc: { fontSize: 9.5, color: '#444455', lineHeight: 1.5 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    tag: {
        fontSize: 9,
        backgroundColor: '#E8F8F3',
        color: '#16A085',
        padding: '2 8',
        borderRadius: 10,
        marginRight: 4,
        marginBottom: 4,
    },
    formItem: { marginBottom: 8 },
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#AAAABC',
    },
});

function CVDocument({ data, atsData }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.nom || 'Candidat'}</Text>
                    <Text style={styles.title}>{data.titre || ''}</Text>
                    {atsData && (
                        <Text style={{ fontSize: 9, color: '#888899', marginTop: 4 }}>
                            Score ATS : {atsData.score}/100 — {atsData.level}
                        </Text>
                    )}
                </View>

                {/* Résumé */}
                {data.resume && (
                    <View>
                        <Text style={styles.sectionTitle}>Résumé professionnel</Text>
                        <Text style={styles.bodyText}>{data.resume}</Text>
                    </View>
                )}

                {/* Expériences */}
                {data.experiences?.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Expériences professionnelles</Text>
                        {data.experiences.map((exp, i) => (
                            <View key={i} style={styles.expItem}>
                                <View style={styles.expRow}>
                                    <Text style={styles.expPoste}>{exp.poste}</Text>
                                    <Text style={styles.expPeriode}>{exp.periode}</Text>
                                </View>
                                <Text style={styles.expEntreprise}>{exp.entreprise}</Text>
                                <Text style={styles.expDesc}>{exp.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Compétences */}
                {(data.competences?.techniques?.length > 0 ||
                    data.competences?.soft_skills?.length > 0) && (
                        <View>
                            <Text style={styles.sectionTitle}>Compétences</Text>
                            <View style={styles.tagsRow}>
                                {[
                                    ...(data.competences?.techniques || []),
                                    ...(data.competences?.soft_skills || []),
                                ].map((s, i) => (
                                    <Text key={i} style={styles.tag}>{s}</Text>
                                ))}
                            </View>
                        </View>
                    )}

                {/* Formation */}
                {data.formation?.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Formation</Text>
                        {data.formation.map((f, i) => (
                            <View key={i} style={styles.formItem}>
                                <View style={styles.expRow}>
                                    <Text style={styles.expPoste}>{f.diplome}</Text>
                                    <Text style={styles.expPeriode}>{f.annee}</Text>
                                </View>
                                <Text style={styles.expEntreprise}>{f.etablissement}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text>Généré par MatchCV — 100% gratuit</Text>
                    <Text>euloge.mabiala@matchcv.fr</Text>
                </View>
            </Page>

            {/* Page lettre de motivation */}
            {data.lettre_motivation && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{data.nom || 'Candidat'}</Text>
                        <Text style={styles.title}>Lettre de motivation</Text>
                    </View>
                    <Text style={styles.bodyText}>{data.lettre_motivation}</Text>
                    <View style={styles.footer} fixed>
                        <Text>Généré par MatchCV — 100% gratuit</Text>
                    </View>
                </Page>
            )}
        </Document>
    );
}

export default function PDFExport({ data, atsData }) {
    if (!data) return null;
    const filename = `CV_adapté_${(data.nom || 'candidat').replace(/\s+/g, '_')}.pdf`;

    return (
        <PDFDownloadLink
            document={<CVDocument data={data} atsData={atsData} />}
            fileName={filename}
            className="btn btn-primary"
        >
            {({ loading }) => (loading ? '⏳ Préparation du PDF...' : '⬇️ Exporter en PDF')}
        </PDFDownloadLink>
    );
}
